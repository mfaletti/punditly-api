'use strict'

exports = module.exports = function(req, res){
	var workflow = new (require('events').EventEmitter)();

	workflow.response = {};

	workflow.on('exception', function(err){
		workflow.response.message = 'An internal service error has occurred. Plase try again another time.';
		workflow.response.code = workflow.response.code || 'InternalServerError';
		res.send(500, workflow.response);
	});

	workflow.on('bad_request', function(err){
		res.send(400, workflow.response);
	});

	workflow.on('auth', function(err){
		workflow.response.code = 403;
		res.send(403, workflow.response);
	});

	workflow.on('not_found', function(err){
		workflow.response = err ? req.app.error_codes[err] : {
			code: 10,
			message: 'The requested resource was not found'
		}

		res.send(404, workflow.response);
	});

	workflow.on('response', function(){
		res.send(workflow.response);
	});

	return workflow;
};