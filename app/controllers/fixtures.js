'use strict';

exports.find = function(req, res, next) {
	//req.query.fixture = req.query.fixture ? req.query.fixture : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};

	if (req.query.league) {
		filters.competition = new RegExp('^.*?'+ req.query.league +'.*$', 'i');
	}

	if (req.query.min_timestamp) {
		if (!isNaN(req.query.min_timestamp)) {
			filters.date = {
				$gte: new Date(Number(req.query.min_timestamp))
			}
		}
	}

	if (req.query.max_timestamp) {
		if (!isNaN(req.query.max_timestamp)) {
			filters.date = {
				$lt: new Date(Number(req.query.max_timestamp))
			}
		}
	}

	if (req.query.sort === 'league') {
		req.query.sort = 'competition';
	}

	req.app.db.models.Fixture.pagedFind({
		filters: filters,
		limit: req.query.limit,
	  	page: req.query.page,
	  	sort: req.query.sort
	}, function(err, results){
		if (err) {
	  	return next(err);
	  }

    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json(results);
	});
};

/*module.exports = function(app) {
	app.get('/1/matches', function(req, res, next) {
		var uid = req.signedCookies['user_id'];
		var count = 0, data = [];

		Game.model.find().lean().exec(function(err, games){
			var func = function(doc, cb){
				Team.model.find({id: {$in: [doc.homeTeam, doc.awayTeam]}}).lean().exec(function(err,teams){
					if (teams[0].id == doc.homeTeam) {
						doc.homeTeam = teams[0];
						doc.awayTeam = teams[1];
					} else {
						doc.awayTeam = teams[0];
						doc.homeTeam = teams[1];
					}

					doc.location = doc.homeTeam.park;
					data.push(doc);
					if (++count == games.length) {
						res.send(200,{response:{status:200},data:data});
					}
				});

				cb(null);
			};

			async.forEach(games, func, function(err){
				if (err) {
					return next(err);
				}
				//res.send(200,{response:{status:200},data:data});
			});
		});
	});
}*/