
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Chart = new Schema({
  username: {type: String, required: true},
  name: {type: String, required: true},
  index: {type: String, required: true, unique: true, dropDups: true},
  data: String,
  time: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Chart', Chart);
