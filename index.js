var
	express = require('express'),
	app = express(),
	fs = require('fs'),
	config = require('./app/config/config'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	cookieSession = require('cookie-session'),
	logger = require('morgan'),
	passport = require('passport'),
	router = express.Router();

app.config = config;

// setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', function(err){
	console.log('error connecting to mongo server');
});
app.db.once('open', function () {
  //and... we have a data store
});

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
	require(models_path+'/'+file)(app, mongoose);
});

// configure some environment variables
app.disable('x-powered-by');
app.set('env', config.env);
app.set('port', config.port);
app.set('jwt-secret', config.jwt_secret);
app.set('views', __dirname + '/app/views');
app.set('uploads', __dirname + '/public/uploads/');
// register ejs as html
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

/**
 * middleware function to check if user is authenticated.
 * use in every route that needs user to be authenticated
 * example:
 * app.get('/foo-route', auth, function(req,res){)
 * 	// user is logged in at this point
 * });
 *
 * using GLOBAL rather than var so method can be accessible in other areas of the app. probably need a better way to do this.
 */
GLOBAL.auth = function(req, res, next) {
	if (!req.signedCookies['sessionId']) {
		res.send(401, {code: 401, message:"Could not authenticate you"});
	} else {
		// don't cache restricted pages
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		next();
	}
};

// middleware
app.use(express['static'](__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser(config.cryptoKey));
app.use(cookieSession({secret: config.cryptoKey}));

app.use(passport.initialize());
app.use(passport.session());

//config express in dev environment
if (app.get('env') === 'dev') {
  app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.send(JSON.stringify(err));
	});
}

//route requests
app.use('/', require('./app/routes'));

app.util = {};
app.util.workflow = require('./app/util/workflow');

var io = require('socket.io').listen(app.listen(app.get('port')));