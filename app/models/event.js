'use strict';

exports = module.exports = function(app, mongoose){
	var EventSchema = new mongoose.Schema({
		gameId : {type:String,default:null},
		type: String,
		created_at: {type: Date, default: Date.now()},
		/* details" : {"score" : 2,"scoring_side" : "A","ownGoal" : "false","penalty" : "false","scorer" : 2345} */
		details: Object
	});

	EventSchema.plugin(require('../plugins/pagedFind'));
	app.db.model('Event', EventSchema, 'events');
};