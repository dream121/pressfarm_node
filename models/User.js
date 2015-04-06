var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  admin: { type: Boolean, default: false },
  datePaid: { type: Date, default: null }
});

/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

userSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(5, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/**
 * Validate user's password.
 * Used by Passport-Local Strategy for password validation.
 */

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Get subscription status
 */

userSchema.methods.subscribed = function() {
  if (this.datePaid !== null) {
    var timeDiff = Math.abs(new Date().getTime() - this.datePaid);
    var daysSincePayment = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysSincePayment <= 30) {
      return true;
    }
  }
  return false;
};

/**
 * Get days left of subscription
 */

userSchema.methods.daysLeft = function() {
  var days = 0;
  if (this.datePaid !== null) {
    var timeDiff = Math.abs(new Date().getTime() - this.datePaid);
    var daysSincePayment = Math.ceil(timeDiff / (1000 * 3600 * 24));
    days = 30 - days;
  }
  return days;
};

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

userSchema.methods.gravatar = function(size) {
  if (!size) size = 200;

  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }

  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

module.exports = mongoose.model('User', userSchema);
