var User = require('../models/User');
var Reporter = require('../models/Reporter');
var json2csv = require('json2csv');
var fs = require('fs');
exports.newReporter = function(req, res) {
  if (!req.user.admin) res.status(404);

  res.render('reporters/new', {
    title: 'Add Reporter'
  });
};

exports.getReporters = function(req, res, next) {
  Reporter.find({}, null, { sort: 'publication' }, function (err, reporters) {
    if (!req.user.subscribed()) {
      req.flash('errors', { msg: 'You currently have a free account. $9 will let you see emails for 30 days.' });
    }
    res.render('reporters/index', {
      title: 'Browse Reporters',
      reporters: reporters,
      subscribed: req.user.subscribed()
    });
  });
};

exports.createReporter = function(req, res, next) {
  if (!req.user.admin) res.status(404);

  req.assert('name', 'Name is required').notEmpty();
  req.assert('email', 'Valid email is required').isEmail();
  req.assert('publication', 'Publication is required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.render('reporters/new', {
      title: 'Add Reporter',
      name: req.body.name,
      email: req.body.email,
      publication: req.body.publication,
      url: req.body.url,
      twitter: req.body.twitter
    });
  }

  var reporter = new Reporter({
    name: req.body.name,
    email: req.body.email,
    publication: req.body.publication,
    url: req.body.url,
    twitter: req.body.twitter
  });

  Reporter.findOne({ email: req.body.email }, function(err, existingReporter) {
    if (existingReporter) {
      req.flash('errors', { msg: 'Reporter with that email address already exists.' });
      res.redirect('/reporters/new');
    }
    reporter.save(function(err) {
      console.log(err);
      if (err) {
        req.flash('errors', { msg: err.err });
      } else {
        req.flash('success', { msg: 'Reporter added!' });
      }
      res.redirect('/reporters/new');
    });
  });

};

exports.Reportercsv = function(req, res) {
Reporter.find({},function(err,reporters){
  var date = Date('dd/mm/yy hh:mm:ss');
  if (err) {
  console.log("error");
  }else{
  console.log(reporters);
  json2csv({data: reporters, fields: ['_id', 'name', 'email','publication','twitter','_v','url']}, function(err, csv) {
  if (err) console.log(err);
  fs.writeFile('csv/file:'+date+'.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved');
       res.redirect('/reporters');
  });
});
  }
});
};
