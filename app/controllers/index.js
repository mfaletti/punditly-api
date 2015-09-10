var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pd');
mongoose.connection.on('error', function() {}); // need this for mongoose shared connections

module.exports = function(app) {
	app.get('/', function(req,res){
		res.send(200, "<a href='/docs'>docs</a>");
	});
	
	app.get('/1/', function(req,res){
		res.send(200);
	});
}