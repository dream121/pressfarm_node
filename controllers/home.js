var secrets = require('../config/secrets');
var stripe =  require('stripe')(secrets.stripe.apiKey);
var Reporter = require('../models/Reporter');
var mcapi = require('mailchimp-api/mailchimp');
var blog = require('wordpress');

var client = blog.createClient({
  /**@MSS
   *remote wordpress installation link and access details **/
  url: "http://blog.press.farm/b",
  username: "dev",
  password: "#Centreville20120!"
});

/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  client.getPosts({ status: 'publish'},  function( error, posts ) {

    var counter = posts.length;
    if (posts.length > 4) {
      posts = posts.slice(0,4);
    }

    Reporter.count({}, function(err, count) {

      if (posts && !error) {
        res.render('home', {
          title: 'Find journalists to write about your startup.',
          count: count,
          posts:posts
        });

      } else {
        res.render('home', {
          title: 'Find journalists to write about your startup.',
          count: count
        });
      }

    },function(err) {
      console.log(err);
      if (err.name == 'Invalid_ApiKey') {
        res.locals.error_flash = "Invalid API key. Set it in app.js";
      } else if (error.error) {
        res.locals.error_flash = error.code + ": " + error.error;
      } else {
        res.locals.error_flash = "An unknown error occurred";
      }
      res.render('home', { title: 'Find journalists to write about your startup' ,count: count});
    });
  });
};

exports.charge = function(req, res) {
  var stripeToken = req.body.stripeToken;
 
  var charge = stripe.charges.create({
    amount: 900,
    currency: 'usd',
    card: stripeToken
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      req.flash('error', { msg: 'There was a problem charging your card. :( No charge has been made.' });
      res.redirect('/account');
    } else {
      var user = req.user;
      user.datePaid = new Date().getTime();
      user.save();
      req.flash('success', { msg: 'Thanks! You now have full access for 30 days. :)' });
      res.redirect('/account');
    }
  });
};

exports.coupn = function(req, res) {
//stripe.coupons.list({ limit: 3 }, function(err, coupons) { console.log("coupons",coupons); });
  stripe.coupons.retrieve(req.body.id, function(err, coupon) {
      if(err){
       //alert(err);
        console.log("shintuerr",err)
        return res.send(err);
      }
      else{
    //   alert("sucess");
        console.log("shintusuccess",coupon);
        return res.send(coupon);
      }
    });
};
exports.salecharge = function(req, res) {
  var stripeToken = req.body.stripeToken;

  var charge = stripe.charges.create({
    amount: 400000,
    currency: 'usd',
    card: stripeToken
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      req.flash('error', { msg: 'There was a problem charging your card. :( No charge has been made.' });
      res.redirect('/');
    } else {
      req.flash('success', { msg: 'Thanks! press farm is now yours.' });
      res.redirect('/');
    }
  });
};

exports.sale = function(req, res) {
  res.render('sale');
};

exports.subscribe = function(req, res){
  mc.lists.subscribe({id:secrets.mailgunformid.key, email:{email:req.body.email}}, function(data) {
    req.flash('success', { msg: 'User subscribed successfully! Look for the confirmation email.' });
      res.redirect('/');
    },
    function(error) {
      if (error.error) {
        console.log("error", error);
        req.flash('errors', { msg: error.code + ": " + error.error });
      } else {
        req.flash('errors', { msg: 'There was an error subscribing that user' });
      }
      res.redirect('/');
    });
};



/*
 * GET home page.
 */


