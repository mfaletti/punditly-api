var mongoose = require('mongoose'),
	User = require('../models/user');
mongoose.connect('mongodb://localhost/pd');
mongoose.connection.on('error', function() {});

module.exports = function(app){
	/**
	 * GET api.punditly.com/1/friendships/following
	 * returns a cursored collection of users the authenticated user is following.
	 */
	app.get('/1/friendships/following', auth, function(req,res){
		var id = req.signedCookies['user_id'];
		var max = req.param('max_id') || '';
		var since = req.param('since_id') || '';
		
		User.model.findOne({id:id}, function(err,user){
			if (!user) {
				
			} else {
				var query = User.model.find();
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
	 * GET api.punditly.com/1/friendships/followers
	 * Returns the list of users that are following the authenticated user
	 */
	app.get('/1/friendships/followers', auth, function(req,res){
		var id = req.signedCookies['user_id'];
		var max = req.param('max_id') || '';
		var since = req.param('since_id') || '';

		User.model.findOne({id:id}, function(err,user){
			if (!user) {
				res.send(200);
			} else {
				var query = User.model.find();
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
	 * POST api.punditly.com/1/friendship/create
	 * Allows the authenticating user to create a friendship with the user specified by the id parameter
	 * Returns the befriended user if successful
	 */
	app.post('/1/friendships/create', auth, function(req,res){
		var params = req.body;
		if (!params.id){
			res.send(400, {response:{status:400}, error:{message: "no Id specified"}});
			return;
		} else if (params.id == req.signedCookies['user_id']) {
			res.send(400, {response:{status:400}, error:{message: "You can't follow yourself"}});
			return;
		}
		
		// verify the followed user exists
		User.model.findOne({id:params.id}, function(err,user){
			if (!user) {
				res.send(404, {response:{status:404}, error:{message :"Followed User Not Found"}});
			} else {
				// make sure we're not already following the requested user
				User.model.findOneAndUpdate({id:req.signedCookies['user_id'],following:{$nin:[user.id]}}, 
					{$push:{following:user.id}},
					{safe:true},
					function(err,model){
						if (err) {
							res.send(500,{response:{status:500}});
						} else if (!model) { // user is currently following the requested user
							res.send(400, {response:{status:400},error:{message:"Already Following"}});
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
	 * POST api.punditly.com/1/friendship/destroy
	 * Allows the authenticating user to unfollow the user specified by the id parameter.
	 * Returns the unfollowed user if successful.
	 * @params id
	 */
	app.post('/1/friendships/destroy', auth, function(req,res){
		var params = req.body;
		if (!params.id){
			res.send(400, {response:{status:400}, error:{message: "no Id specified"}});
			return;
		} else if (params.id == req.signedCookies['user_id']) {
			res.send(400, {response:{status:400}, error:{message: "You can't unfollow yourself"}});
			return;
		}
		
		// verify the followed user exists
		User.model.findOne({id:params.id}, function(err,user){
			if (!user) {
				res.send(404, {response:{status:404}, error:{message :"User Not Found"}});
			} else {
				// make sure we're not already following the requested user
				User.model.findOneAndUpdate({id:req.signedCookies['user_id'],following:{$in:[user.id]}}, 
					{$pull:{following:user.id}},
					{safe:true},
					function(err,model){
						if (err) {
							res.send(500,{response:{status:500}});
						} else if (!model) { // user is currently not following the requested user
							res.send(400, {response:{status:400},error:{message:"Not Following"}});
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