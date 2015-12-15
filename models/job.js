var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var JobSchema   = new Schema({
	_id: Number,
   	title: String,
	company: String,
	localization: String,
	category: String,
	description: String,
	contract: String,
	date: String,
	tags: Array
});

//Job title
//Company
//Localization
//Category
//Description
//Contract
//Date
//Tags

module.exports = mongoose.model('Job', JobSchema);
