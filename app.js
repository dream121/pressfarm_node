/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var csrf = require('lusca').csrf();
var methodOverride = require('method-override');
var _ = require('lodash');
var MongoStore = require('connect-mongo')({ session: session });
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var multer  = require('multer');
var done=false;
var express = require('express');
var nodemailer = require('nodemailer');
var json2csv = require('json2csv');
var fs          = require('fs');
/**
 * Controllers (route handlers).
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var reporterController = require('./controllers/reporter');
var importController = require('./controllers/import');
var blogController= require('./controllers/blog');
var stripController= require('./controllers/stripform.js');
/**
 * API keys and Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Connect to MongoDB.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

var hour = 3600000;
var day = hour * 24;
var week = day * 7;

/**
 * CSRF whitelist.
 */

var csrfExclude = ['/charge', '/salecharge','/upload','/strippost','/coupn','/deletereporters'];

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 9600);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/public/js', express.static(path.join(__dirname, '/public/js')));
app.use('/public/css', express.static(path.join(__dirname, '/public/css')));
app.use(function(req, res, next) {
  // CSRF protection.
  if (_.contains(csrfExclude, req.path)) return next();
  csrf(req, res, next);
});
app.use(function(req, res, next) {
  // Make user object available in templates.
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  // Remember original destination before login.
  var path = req.path.split('/')[1];
  if (/auth|login|logout|signup|fonts|favicon/i.test(path)) {
    return next();
  }
  req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));


//file upload
app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

/**
 * Redirect www to non-www
 */
app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null && process.env.ENV === 'production') {
    res.redirect('https://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();     
  }
});

/**
 * Force SSL
 */
app.all('*', function(req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.ENV === 'production')
    res.redirect('https://press.farm' + req.url);
  else
    next();
});

/**
 * Main routes.
 */

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/import', passportConf.isAuthenticated,importController.index);
app.post('/deletereporters', importController.deletereporters);
app.post('/upload', importController.importer);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.get('/reporters',passportConf.isAuthenticated, reporterController.getReporters);
app.get('/reporters/new',passportConf.isAuthenticated, reporterController.newReporter);
app.get('/reporters/csv', reporterController.Reportercsv);
app.post('/reporters', passportConf.isAuthenticated, reporterController.createReporter);
app.post('/charge', passportConf.isAuthenticated, homeController.charge);
app.post('/salecharge', homeController.salecharge);
app.get('/sale', homeController.sale);
app.get('/blog', blogController.index);
app.get('/blog/post/:id', blogController.single);
app.get('/stripform', stripController.index);
app.post('/coupn', homeController.coupn);

//s
//strip
app.post("/strippost", function(req, res) {
  var stripeToken = req.body.stripeToken;

  var charge = stripe.charges.create({
    amount: 900,
    currency: 'usd',
    card: stripeToken
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      req.flash('error', { msg: 'There was a problem charging your card. :( No charge has been made.' });
      console.log("failure");
    } else {
      var user = req.user;
      user.datePaid = new Date().getTime();
      user.save();
      req.flash('success', { msg: 'Thanks! You now have full access for 30 days. :)' });
     console.log("success");
    }
  });
});

/***
 * Trigger email export to mail chimp after every minutes
 */
var cron      = require('cron');
var MCapi     = require('mailchimp-api');
var User      = require('./models/User');
var Reporters = require('./models/Reporter');

/***
 * Blank array to store subscribers
 */
User.find(function(error, data){
  var userSibscribers = []
  if( !error && data ) {
    data.forEach(function(item) {
      userSibscribers.push({name:item.email, email: item.email});
    });
    //console.log("userSibscribers",userSibscribers);
  } 
});



var cronJob = cron.job("0 */30 * * * *", function(){

    // perform operation e.g. GET request http.get() etc.
    console.info('cron job completed');
    
    MC = new MCapi.Mailchimp('86fc09c02e572d77ab079a95c34a0c1f-us9');
    Reporters.find({},function(err,reporters){
      if (err) {
      console.log("error");
      }else{
      console.log(reporters);
      json2csv({data: reporters, fields: ['_id', 'name', 'email','publication','twitter','_v','url']}, function(err, csv) {
      if (err) console.log(err);
      fs.writeFile('csv/file2.csv', csv, function(err) {
      fs.chmodSync('csv/file2.csv', 0777);
      if (err) throw err;
        console.log('file saved');


        var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Mailgun',
    auth: {
          user: secrets.mailgun.user,
          pass: secrets.mailgun.password
        }
      });
console.log('mailsend');
      var mailOptions = {
        to: 'mss.jeevanverma@gmail.com',
        from: 'contact@press.farm',
        subject: 'Pressfarm Attachment',
        text: 'Please find attachment csv file.',
        attachments : [{'filename': 'csv/file2.csv','contents':csv}]
             };
      smtpTransport.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
      });
      });
        }
    });

  }); 
cronJob.start();

/**
 * 500 Error Handler.
 */

app.use(errorHandler());

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
