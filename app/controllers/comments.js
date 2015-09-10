var mongoose = require('mongoose'),
	Comment = require('../models/comment'),
	validator = require('../models/validator'),
	_ = require('underscore'),
	async = require('async'),
	User = require('../models/user');
mongoose.connect('mongodb://localhost/pd');
mongoose.connection.on('error', function() {});

module.exports = function(app) {
	/**
	 * Returns a collection of the most recent comments posted to the authenticating user's home stream. 
	 * The collection is made up of users and teams symbols the user follows.
	 *
	 */
	app.get('/1/comments/home_timeline', auth, function(req, res, next){
		var uid = req.signedCookies['user_id'];
		var since = req.param('since_id') || '';
		var max = req.param('max_id') || '';
		var limit = req.param('limit') || 20;
		
		if (limit > 50) {
			limit = 50;
		}
		
		User.model.findOne({id:uid},'following',{lean:true}, function(err,user){
			if (err){
				return next(err);
			} else {
					user.following.push(uid); // include user's comments as part of comments to display
					var query = Comment.model.find();
					query.where('user').in(user.following);
					
					if (max && max.length == 24) {
						var objId = mongoose.Types.ObjectId(max);
						query.where('created_at').lte(objId.getTimestamp());
					}
					
					if (since && since.length == 24) {
						var objId = mongoose.Types.ObjectId(since);
						query.where('created_at').gte(objId.getTimestamp());
					}
					
					query.limit(limit)
					.sort('-created_at')
					.lean()
					.exec(function(err,docs){
						
						if (req.query.trim_user === 'true') {
							_.each(docs, function(doc,key,list){
								doc.user = {id:doc.user};
							});
							
							res.send(200,{response:{status:200},data:docs});
							return;
						}
						
						// MongoDB does not have joins, so use comment.user to reference the user collection & join both collections
						var commenters = _.pluck(docs, 'user');
						var uniq = _.uniq(commenters); // unique commentators
						var data = [];
						
						// find users in the unique set of commentators
						User.model.find({id:{$in: uniq}}).exec(function(err,users){
							var join = function(doc, cb){
								_.each(users, function(user,index,list){
									if (doc.user == user.id){
										doc.user = user;
										data.push(doc);
										return;
									}
								});
								
								cb(null);
							};
							
							async.each(docs, join, function(err){
								res.send(200,{response:{status:200},data:data});
							});
						});
					});
			}
		});
	});
	
	/**
	 * GET api.punditly.com/1/comments/mentions
	 * Returns the 20 most recent comments containing the authenticating user's handle.
	 */
	app.get('/1/comments/mentions', auth, function(req, res){
		var uid = req.signedCookies['user_id'];
		var since = req.param('since_id') || '';
		var max = req.param('max_id') || '';
		var limit = req.param('limit') || 20;
		var trim = req.param('trim_user') || false;
		limit = limit > 50 ? 50 : limit;
		
		User.model.findOne({id:uid}, function(err,user){
			if (user) {
				var str = '@' + user.username;
				var query = Comment.model.find();
				query.where({text: {$regex:str,$options:'i'}});
				
				if (max && max.length == 24) {
					var objId = mongoose.Types.ObjectId(max);
					query.where('created_at').lte(objId.getTimestamp());
				}

				if (since && since.length == 24) {
					var objId = mongoose.Types.ObjectId(since);
					query.where('created_at').gte(objId.getTimestamp());
				}
				 
				query.lean()
				.limit(limit)
				.sort('-created_at')
				.exec(function(err, mentions){
					/*if (trim) {
						_.each(mentions, function(mention,key,list){
							mention.user = {id:mention.user.id};
						});
					}*/
					
					res.send(200, {response:{status:200},data:mentions});
				});
			} else {
				res.send(200, {response:{status:200},data:{}})
			}
		});
	});
	
	// returns a single comment identified by the id parameter.
	app.get('/1/comments/:id', function(req, res){
		var id = req.param('id');
		Comment.model.findOne({id:id}, function(err,comment){
			if (err) {
				res.send(500,{response:{status:500}});
			} else if (!comment) {
				res.send(404,{response:{status:404},error:{message:"Not Found"}});
			} else {
				User.model.findOne({id:comment.user}, function(err,p){
					if (err) {
						res.send(500,{response:{status:500}});
					} else if (!p) { //comments without active user account
						res.send(404,{response:{status:404},error:{message:"Not Found"}});
					} else {
						comment = comment.toJSON();
						comment.user = p.toJSON();
						
						if (req.query.trim_user === 'true') {
							comment.user = {id:p.id};
						}
						
						res.send(200,{response:{status:200},data:comment});
					}
				});
			}
		});
	});
	
	/**
	 * Create a comment.
	 *
	 */
	app.post('/1/comments/create', auth, function(req,res){
		var params = req.body;
		
		var v = new validator();
    v.check(params.text, 'No Comment').notEmpty();
		var errors = v.getErrors();
		
		if (errors.length) {
			res.send(400, {response:{status:400},error:{message:errors[0]}});
		}
		
		var event_id = params.event_id || null;
		//generate mongo objectID
    var oid = mongoose.Types.ObjectId();
    var comment = new Comment.model({
      _id: oid,
      id: oid.toString(),
      text: params.text,
      user: req.signedCookies['user_id'],
			event_id: params.event_id || '',
			in_reply_to_comment_id: params.in_reply_to_comment_id || null
    });

		comment.save(function (err, c) {
      if (err) {
        res.send(500, {response:{status:500}});
        return;
      }

			User.model.findOne({id:comment.user}, function(err,person){
				if (err) {
					res.send(500,{response:{status:500}});
				} else {
					c = c.toJSON();
					c.user = person.toJSON();
					
					if (req.query.trim_user === 'true') {
						c.user = {id:person.id};
					}
					
					res.send(200,{response:{status:200},data:c});
				}
			});
    });
	});
}