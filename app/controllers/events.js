'use strict';

exports.find = function(req, res, next){
	var workflow = req.app.util.workflow(req, res);

	var id = req.params.id || '';

	if (req.params.id.length < 24) { // make sure it's a valid objectid string of 24 hex chars
		return workflow.emit('bad_request', 'INVALID_GAME_ID');
	}

	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};
	filters.gameId = id;

	req.app.db.models.Event.pagedFind({
		filters: filters,
		limit: req.query.limit,
  	page: req.query.page,
  	sort: req.query.sort
	}, function(err, results){
		if (err) {
  		return next(err);
  	}

    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    results.filters = req.query;
    res.send(JSON.stringify(results));
	});
};

exports.create = function(req, res){
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.body.gameId) {
			return workflow.emit('bad_request', 'NO_GAME_ID');
		}

		if (!req.body.type) {
			return workflow.emit('bad_request', 'NO_EVENT_TYPE');
		}

		if (!req.body.details) {
			return workflow.emit('bad_request', 'NO_EVENT_DETAILS');
		}

		return workflow.emit('addEvent');
	});

	workflow.on('addEvent', function(){
		var
		data = req.body,
		fieldsToSet = {
			gameId: data.gameId,
			created_at: new Date(),
			type: data.type,
			details:{},
		};

	  switch (data.type) {
			case 'goal':

				if (!data.details.player) {
					return workflow.emit('bad_request', 'NO_SCORER_DATA');
				}

				if (!data.details.scoring_side) {
					return workflow.emit('bad_request', 'NO_SCORING_SIDE_DATA');
				}

				if (!data.details.score) {
					return workflow.emit('bad_request', 'NO_SCORE_DATA');
				}

				fieldsToSet.details.player = data.details.player;
				fieldsToSet.details.penalty = data.details.penalty || false;
				fieldsToSet.details.ownGoal = data.details.ownGoal || false;
				fieldsToSet.details.scoring_side = data.details.scoring_side;
				fieldsToSet.details.score = data.details.score;
				break;
			case 'yellow_card':
			case 'red_card':
				if (!data.details.player) {
					return workflow.emit('bad_request', 'NO_PLAYER_ID');
				}

				fieldsToSet.details.player = data.details.player;
				break;
		}

		req.app.db.models.Event.create(fieldsToSet, function(err, event){
			if (err) {
				return workflow.emit('exception', err);
			}

			res.send(event);
		});
	});

	workflow.emit('validate');
}