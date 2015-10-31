var 
express = require('express'),
router = express.Router(),
jwt = require('jsonwebtoken'),
workflow = require


//auth
router.post('/v1/auth/login', require('./controllers/auth').login);
router.post('/v1/auth/register', require('./controllers/auth').register);
router.post('/v1/auth/logout', require('./controllers/auth').logout);

function doAuth(req, res, next){
	var token = req.cookies.AUTH_TOKEN || req.body.token || req.query.token || req.headers['x-access-token'];
	var workflow = req.app.util.workflow(req, res);

	// decode token
	if (token) {
		jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded){
			if (err) {
				return workflow.emit('auth', 'INVALID_TOKEN');
			} else {
				req.decoded = decoded;
				req.token = token;
				return next();
			}
		});
	} else { // no token provided
		return workflow.emit('auth', 'NO_TOKEN');
	}
};

//leagues
router.get('/v1/leagues', doAuth, require('./controllers/leagues').find);
router.get('/v1/leagues/:id/teams', doAuth, require('./controllers/leagues').getTeams);

//teams
router.get('/v1/teams', doAuth, require('./controllers/teams').find);
router.get('/v1/teams/:id', doAuth, require('./controllers/teams').read);

//fixtures
router.get('/v1/fixtures', doAuth, require('./controllers/fixtures').find);

//events
router.post('/v1/events', doAuth, require('./controllers/events').create);
router.get('/v1/events/:id', doAuth, require('./controllers/events').find);

//users
router.get('/v1/users/:id', doAuth, require('./controllers/users').read);
router.post('/v1/account/profile', doAuth, require('./controllers/users').profile);
//router.post('/v1/account/settings', doAuth, require('./controllers/users').settings);
router.post('/v1/account/profile_image', doAuth, require('./controllers/users').profile_image);

module.exports = router;