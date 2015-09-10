var
  bcrypt = require('bcryptjs'),
  v = require('validator'),
	crypto = require('crypto'),
  async = require('async');


/**
 * POST auth/login - authenticate a user.
 * example: http://api.punditly.com/1/auth/login
 * Authenticate a user into the app.
 */
exports.login = function(req, res, next){
	var
		workflow = req.app.util.workflow(req, res),
		params = req.body,
		errors = [];

	if (!params.username) {
		errors.push('Username is Required');
	}

	if (!params.password) {
		errors.push('Password is Required');
	}

	if (errors.length) {
		workflow.response.message = errors[0];
		return workflow.emit('bad_request');
	}

	req.app.db.models.User.findByUsername(params.username, function(error, person){
		if (error) {
			return next(err);
		} else if (!person) {
			workflow.response.message = "Invalid Username or Password";
			return workflow.emit('auth');
		} else {
			req.app.db.models.User.validatePassword(params.password, person.passwordHash, function(err,status){
				if (status) {
					var seed = crypto.randomBytes(20);
					var id = crypto.createHash('sha1').update(seed).digest('hex');
					res.cookie('sessionId', id, {signed:true});
					res.cookie('user_id', person.id, {signed:true});

					res.send(JSON.stringify(person));
				} else {
					workflow.response.message = "Invalid Username or Password";
					return workflow.emit('auth');
				}
			});
		}
	});
};

/**
 * POST auth/logout
 * logs a user out
 */
exports.logout = function(req, res, next){
	var id = req.signedCookies['sessionId'];
	if (id) {
		res.clearCookie('sessionId', {path: '/' });
		res.clearCookie('user_id', {path: '/' });
	}

	res.send(200);
};

/**
 * POST auth/register - Creates new user.
 * example: http://api.punditly.com/1/auth/register
 * creates new user and returns a json object represention of the newly created resource.
 */
exports.register = function (req, res, next) {
	var
		workflow = req.app.util.workflow(req, res),
		params = req.body,
		errors = [];

  if (!v.isEmail(params.email)) {
		errors.push('Email is not a valid format');
	}

	if (!params.password) {
		errors.push('Password is required');
	}

	if (!v.isLength(params.password, 6, 20)) {
		errors.push('Password is too short. Use at least 6 characters');
	}

	if (!v.isLength(params.username, 2, 20)) {
		errors.push('Username is required');
	}

  if (errors.length) {
    workflow.response.message = errors[0];
    return workflow.emit('bad_request');
  }

  var fieldsToSet = {
    email: params.email,
    username: params.username
  };

  // run the validation checks in parallel.
  async.parallel([
  	function(cb){
  		req.app.db.models.User.findByEmail(params.email, function(err, user){
		  	if (err) {
		  		cb(err);
		  	}

		  	if (user) { // user with this email currently exists
		  		workflow.response.message = "That Email has already been taken";
		  		return workflow.emit('bad_request');
		  	} else {
		  		cb(null, true);
		  	}
		  });
  	},
  	function(cb){
  		req.app.db.models.User.findByUsername(params.username, function(err, user){
  			if (err) {
		  		cb(err);
		  	}

		  	if (user) { // user with this username currently exists
		  		workflow.response.message = "That Username has already been taken";
		  		return workflow.emit('bad_request');
		  	} else {
		  		cb(null, true);
		  	}
		  });
  	}
  ],
  function(err, results){
  	if (err) {
  		return next(err);
  	} else {
  		req.app.db.models.User.encryptPassword(params.password, function(err, hash){
  			if (err || !hash) {
  				return workflow.emit('exception');
  			}

  			fieldsToSet.passwordHash = hash;
  			var userModel = new req.app.db.models.User(fieldsToSet);
  			userModel.save(function(err, user){
					if (err) {
						return workflow.emit('exception');
					}

					res.send(201, user.toJSON());
				});
  		});
  	}
  });
};