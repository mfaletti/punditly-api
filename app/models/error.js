'use strict'

exports = module.exports = function(app){
	var error_codes = {
		INVALID_USER_ID : {
			code: 11,
			message: 'The requested user id is not valid'
		},
		INVALID_TEAM_ID : {
			code: 12,
			message: 'The requested team id is not valid'
		}
	}
	app.error_codes = error_codes;
};