'use strict';

exports.find = function(req, res, next) {

	var workflow = req.app.util.workflow(req, res, next);

	req.query.name = req.query.name ? req.query.name : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};

	if (req.query.name) {
    filters.name = new RegExp('^.*?'+ req.query.name +'.*$', 'i');
  }

	if (req.query.league) {
    filters.league = req.query.league;
  }

	req.app.db.models.Team.pagedFind({
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
    res.send(results);
	});
};

exports.read = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);
	
	if (!req.app.db.models.Team.isValid(req.params.id)) { // make sure it's a valid objectid
		return workflow.emit('not_found', 'INVALID_TEAM_ID');
	}

	req.app.db.models.Team.findById(req.params.id, function(err, team){
		if (err) {
			return next(err);
		}else if (!team) {
			return workflow.emit('not_found');
		} else {
			res.send(team);
		}
	});
};