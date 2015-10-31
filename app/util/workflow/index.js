'use strict'

exports = module.exports = function(req, res){
	var workflow = new (require('events').EventEmitter)();
	var errors =[];

	workflow.response = {};

	workflow.on('exception', function(err){
		workflow.response.message = 'An internal service error has occurred. Plase try again another time.';
		workflow.response.code = workflow.response.code || 'InternalServerError';

		res.status(500);
		return workflow.emit('response');
	});

	workflow.on('bad_request', function(err){
		workflow.response = err ? req.app.error_codes[err] : {
			code: 400,
			message: 'The request was invalid'
		};

		res.status(400);
		return workflow.emit('response');
	});

	workflow.on('auth', function(err){
		workflow.response = err ? req.app.error_codes[err] : {
			code: 403,
			message: 'Bad authentication data'
		};

		res.status(403);
		return workflow.emit('response');
	});

	workflow.on('not_found', function(err){
		workflow.response = err ? req.app.error_codes[err] : {
			code: 404,
			message: 'The requested resource was not found'
		}

		res.status(404);
		return workflow.emit('response');
	});

	workflow.on('response', function(){
		res.json(workflow.response);
	});

	return workflow;
};