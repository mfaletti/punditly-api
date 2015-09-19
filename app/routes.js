var 
express = require('express'),
router = express.Router();

//leagues
router.get('/v1/leagues', require('./controllers/leagues').find);
router.get('/v1/leagues/:id/teams', require('./controllers/leagues').getTeams);

//teams
router.get('/v1/teams', require('./controllers/teams').find);
router.get('/v1/teams/:id', require('./controllers/teams').read);

//fixtures
router.get('/v1/fixtures', require('./controllers/fixtures').find);

//events
router.post('/v1/events', require('./controllers/events').create);
router.get('/v1/events/:id', require('./controllers/events').find);

//users
router.get('/v1/users/:id', require('./controllers/users').read);
router.post('/v1/account/profile', auth, require('./controllers/users').profile);
//router.post('/v1/account/settings', auth, require('./controllers/users').settings);
router.post('/v1/account/profile_image', auth, require('./controllers/users').profile_image);

//auth
router.post('/v1/auth/login', require('./controllers/auth').login);
router.post('/v1/auth/register', require('./controllers/auth').register);
router.get('/v1/auth/logout', require('./controllers/auth').logout);

module.exports = router;