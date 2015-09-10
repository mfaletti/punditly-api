'use strict';

exports.find = function(req, res, next){
	var workflow = req.app.util.workflow(req, res);

	var id = req.params.id || '';

	if (req.params.id.length < 24) { // make sure it's a valid objectid string of 24 hex chars
		workflow.response.code = 'INVALID_GAME_ID';
		workflow.response.message = 'The requested game Id is not valid';
		return workflow.emit('bad_request');
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
			workflow.response.code = 'NO_GAME_ID';
			workflow.response.message = 'game ID is required';
			return workflow.emit('bad_request');
		}

		if (!req.body.type) {
			workflow.response.code = 'NO_EVENT_TYPE';
			workflow.response.message = 'Event type is required';
			return workflow.emit('bad_request');
		}

		return workflow.emit('addEvent');
	});

	workflow.on('addEvent', function(){
		var
		data = req.body,
		fieldsToSet = {
			gameId: data.gameId,
			type: data.type,
			details:{}
		};

	  switch (data.type) {
			case 'goal':

				if (!data.details.player) {
					workflow.response.code = 'NO_SCORER_DATA';
					workflow.response.message = 'Scorer is required';
					return workflow.emit('bad_request');
				}

				if (!data.details.scoring_side) {
					workflow.response.code = 'NO_SCORING_SIDE_DATA';
					workflow.response.message = 'Scoring side is required';
					return workflow.emit('bad_request');
				}

				if (!data.details.score) {
					workflow.response.code = 'NO_SCORE_DATA';
					workflow.response.message = 'Score is required';
					return workflow.emit('bad_request');
				}

				fieldsToSet.details.player = data.details.scorer;
				fieldsToSet.details.penalty = data.details.penalty || '';
				fieldsToSet.details.ownGoal = data.details.ownGoal || '';
				fieldsToSet.details.scoring_side = data.details.scoring_side;
				fieldsToSet.details.score = data.details.score;
				break;
			case 'yellow_card':
			case 'red_card':
				if (!data.details.player) {
					workflow.response.code = 'NO_PLAYER_DATA';
					workflow.response.message = 'Player is required';
					return workflow.emit('bad_request');
				}

				fieldsToSet.details.player = data.details.player;
				break;
		}

		req.app.db.models.Event.create(fieldsToSet, function(err, event){
			if (err) {
				return workflow.emit('exception', err);
			}

			res.send(JSON.stringify(event));
		});
	});

	workflow.emit('validate');
}