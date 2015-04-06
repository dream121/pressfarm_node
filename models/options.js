var mongoose = require('mongoose');

var optionSchema = new mongoose.Schema({
    _id:{type:String,unique:false},
  name: { type: String, required: true,unique:false },
  value: { type: String,unique:false}
});
module.exports = mongoose.model('Options', optionSchema);