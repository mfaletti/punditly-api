'use strict';

module.exports = function(app){
	/**
	 * GET /1/friendships/following
	 * returns a cursored collection of users the authenticated user is following.
	 */
	app.get('/1/friendships/following', auth, function(req,res){
		var 
		id = req.signedCookies['user_id'],
		max = req.param('max_id') || '',
		since = req.param('since_id') || '',
		workflow = req.app.util.workflow(req, res);
		
		req.app.db.models.User.findOne({id:id}, function(err,user){
			if (!user) {
				return workflow.emit('not_found');
			} else {
				var query = req.app.db.models.User.find();
				query.where({id: {$in: user.following}});
				
				if (max && max.length == 24) {
					var objId = mongoose.Types.ObjectId(max);
					query.where('created_at').lte(objId.getTimestamp());
				}
				
				if (since && since.length == 24) {
					var objId = mongoose.Types.ObjectId(since);
					query.where('created_at').gte(objId.getTimestamp());
				}
				
				query.limit(20)
				.sort('-created_at')
				.exec(function(err,following){
					res.send(200, {response:{status:200},data: following});
				});	
			}
		});
	});
	
	/**
	 * GET /1/friendships/followers
	 * Returns the list of users that are following the authenticated user
	 */
	app.get('/1/friendships/followers', auth, function(req,res){
		var 
		id = req.signedCookies['user_id'],
		max = req.param('max_id') || '',
		since = req.param('since_id') || '',
		workflow = req.app.util.workflow(req, res);

		req.app.db.models.User.findOne({id:id}, function(err,user){
			if (!user) {
				return workflow.emit('not_found');
			} else {
				var query = req.app.db.models.User.find();
				query.where({following: {$in: [user.id]}});

				if (max && max.length == 24) {
					var objId = mongoose.Types.ObjectId(max);
					query.where('created_at').lte(objId.getTimestamp());
				}

				if (since && since.length == 24) {
					var objId = mongoose.Types.ObjectId(since);
					query.where('created_at').gte(objId.getTimestamp());
				}

				query.limit(20)
				.sort('-created_at')
				.exec(function(err,followers){
					res.send(200, {response:{status:200}, data:followers});
				});	
			}
		});
	});
	
	/**
	 * POST /1/friendship/create
	 * Allows the authenticating user to create a friendship with the user specified by the id parameter
	 * Returns the befriended user if successful
	 */
	app.post('/1/friendships/create', auth, function(req,res){
		var 
		params = req.body,
		workflow = req.app.util.workflow(req, res);
		
		if (!params.id){
			return workflow.emit('bad_request');
		} else if (params.id == req.signedCookies['user_id']) {
			workflow.response.code = 'CANNOT_FOLLOW_SELF';
			return workflow.emit('bad_request');
		}
		
		// verify the followed user exists
		req.app.db.models.User.findOne({id:params.id}, function(err,user){
			if (!user) {
				workflow.response.code = "REQUESTED_USER_NOT_FOUND";
				return workflow.emit('not_found');
			} else {
				// make sure we're not already following the requested user
				req.app.db.models.User.model.findOneAndUpdate({id:req.signedCookies['user_id'],following:{$nin:[user.id]}}, 
					{$push:{following:user.id}},
					{safe:true},
					function(err,model){
						if (err) {
							return workflow.emit('exception');
						} else if (!model) { // user is currently following the requested user
							workflow.response.code = 'ALREADY_FOLLOWING_RESOURCE';
							return workflow.emit('bad_request');
						} else {
							++model.following_count; // increment following user's following count
							++user.followers_count; //increment followed user's followers count
							model.save(function(e,p){
								user.save(function(error,followed_user){
									res.send({response:{status:200},data:followed_user});
								})
							});
						}
				});
			}
		});
	});
	
	/**
	 * POST 1/friendship/destroy
	 * Allows the authenticating user to unfollow the user specified by the id parameter.
	 * Returns the unfollowed user if successful.
	 * @params id
	 */
	app.post('/1/friendships/destroy', auth, function(req,res){
		var 
		params = req.body,
		workflow = req.app.util.workflow(req, res);

		if (!params.id){
			return workflow.emit('bad_request');
		} else if (params.id == req.signedCookies['user_id']) {
			workflow.response.code = 'CANNOT_UNFOLLOW';
			return workflow.emit('bad_request');
		}
		
		// verify the followed user exists
		req.app.db.models.User.model.findOne({id:params.id}, function(err,user){
			if (!user) {
				workflow.response.code = 'USER_NOT_FOUND';
				return workflow.emit('bad_request');
			} else {
				// make sure we're currently following the requested user
				req.app.db.models.User.model.findOneAndUpdate({id:req.signedCookies['user_id'],following:{$in:[user.id]}}, 
					{$pull:{following:user.id}},
					{safe:true},
					function(err,model){
						if (err) {
						return workflow.emit('exception');
						} else if (!model) { // user is currently not following the requested user
							workflow.response.code = "CANNOT_UNFOLLOW_USER";
							return workflow.emit('bad_request');
						} else {
							--model.following_count; // increment following user's following count
							--user.followers_count; //increment followed user's followers count
							model.save(function(e,p){
								user.save(function(error,deleted_user){
									res.send({response:{status:200},data:deleted_user});
								})
							});
						}
				});
			}
		});
	});
};