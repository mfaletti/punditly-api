'use strict';

exports = module.exports = function(app, mongoose) {
	var leagueSchema = new mongoose.Schema({
		name : String,
		country: String
	});

	leagueSchema.plugin(require('../plugins/pagedFind'));
	app.db.model('League', leagueSchema, 'leagues');
};