var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CompagnySchema   = new Schema({
	name: String
});


module.exports = mongoose.model('Company', CompagnySchema);
