var crypto = require('crypto');
var mongoose = require('mongoose');

var reporterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  publication: { type: String, required: true },
  url: { type: String, default: 'Not available :(' },
  twitter: { type: String, unique: true, lowercase: true }
});

reporterSchema.methods.gravatar = function(size) {
  if (!size) size = 200;

  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }

  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

module.exports = mongoose.model('Reporter', reporterSchema);