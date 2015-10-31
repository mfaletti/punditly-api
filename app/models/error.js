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
		},
		USER_NAME_REQUIRED : {
			code: 13,
			message: 'Username is required'
		},
		PASSWORD_REQUIRED : {
			code: 14,
			message: 'Password is required'
		},
		INVALID_TOKEN : {
			code: 15,
			message: 'Failed to authenticate token'
		},
		NO_TOKEN : {
			code: 16,
			message: 'Failed to authenticate: No token provided'
		}
	}
	app.error_codes = error_codes;
};