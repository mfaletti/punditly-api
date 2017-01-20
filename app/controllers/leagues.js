'use strict';
exports.find = function(req,res,next) {
	req.app.db.models.League.find().lean().exec(function(err, results){
		if (err) {
			return next(err);
		}

		res.json(results);
	});
};
exports.getTeams = function(req,res,next) {
	var workflow = req.app.util.workflow(req, res);

	if (req.params.id.length < 24) { // make sure it's a valid objectid string of 24 hex chars
		return workflow.emit('bad_request');
	}

	// first find the league's name, then find teams with matching league names
	req.app.db.models.League.findById(req.params.id, function(err, league){
		if (err) {
			return next(err);
		} else if (!league) {
			return workflow.emit('not_found');
		}

		req.app.db.models.Team.find({league:league.name}, function(err, teams){
			if (err) {
				return next(err);
			}

			res.json(teams);
		});
	});
};