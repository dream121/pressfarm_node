var crypto = require('crypto');
var mongoose = require('mongoose');

/***
 * Add mailchimp collection to store mailchimp subscribers
 */
var smailchimpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  mailinglist: { type: String, required: true },
});

module.exports = mongoose.model('smailchimp', smailchimpSchema);