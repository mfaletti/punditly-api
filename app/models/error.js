'use strict'

exports = module.exports = function(app){
	app.error_codes = {
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
		USER_NOT_FOUND: {
			code: 21,
			message: 'user not found'
		},
		CANNOT_UNFOLLOW_YOURSELF : {
			code: 22,
			message: 'You cannot unfollow yourself'
		},
		CANNOT_UNFOLLOW_USER : {
			code: 23,
			message: 'You cannot unfollow a user you are not following'
		},
		CANNOT_FOLLOW_SELF : {
			code: 24,
			message: 'You cannot follow yourself'
		},
		REQUESTED_USER_NOT_FOUND : {
			code: 25,
			message: 'requested user not found'
		},
		ALREADY_FOLLOWING_RESOURCE: {
			code: 26,
			message: 'alrady following that user'
		},
		BAD_LEAGUE_ID : {
			code: 31,
			message: 'The requested league ID is not valid'
		},
		INVALID_GAME_ID :{
			code: 32,
			message: 'The requested game id is invalid'
		},
		NO_GAME_ID :{
			code: 33,
			message: 'game id is required'
		},
		NO_EVENT_TYPE :{
			code: 34,
			message: 'Event type is required'
		},
		NO_EVENT_DETAILS:{
			code: 35,
			message: 'No event details provided'
		},
		NO_SCORER_DATA:{
			code: 36,
			message: 'Scorer is required'
		},
		NO_SCORING_SIDE_DATA :{
			code: 37,
			message: 'Scoring side is required'
		},
		NO_SCORE_DATA :{
			code: 38,
			message: 'No score data'
		},
		NO_PLAYER_ID :{
			code: 39,
			message: 'Player id is required'
		}
	}
};