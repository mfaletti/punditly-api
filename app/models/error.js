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
		},
		INVALID_GAME_ID :{
			code: 31,
			message: 'The requested game Id is invalid'
		},
		NO_GAME_ID :{
			code: 32,
			message: 'game ID is required'
		},
		NO_EVENT_TYPE :{
			code: 33,
			message: 'Event type is required'
		},
		NO_EVENT_DETAILS:{
			code: 34,
			message: 'No event details provided'
		},
		NO_SCORER_DATA:{
			code: 35,
			message: 'Scorer is required'
		},
		NO_SCORING_SIDE_DATA :{
			code: 36,
			message: 'Scoring side is required'
		},
		NO_SCORE_DATA :{
			code: 37,
			message: 'No score data'
		},
		NO_PLAYER_ID :{
			code: 38,
			message: 'Player ID is required'
		}
	}
	app.error_codes = error_codes;
};