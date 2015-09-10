'use strict';

exports = module.exports = function(app, mongoose) {
	var CommentSchema = new mongoose.Schema({
		in_reply_to_comment_id : {type: String, index:true, default:null},
		user: String,
		created_at: {type: Date, index: true, default: Date.now},
		text:String,
		favorite_count: {type:Number,default:0},
		event_id: String,
		deleted:{type:Boolean, default:false},
		share_count: {type:Number,default:0}
	});
	
	CommentSchema.methods.toJSON = function() {
	  obj = this.toObject();
	  return obj;
	};
	
	CommentSchema.statics.findByUser = function(uid, cb) {
		return this.findOne({user:uid}, cb());
	};
	
	app.db.model('Comment', CommentSchema, 'comments');
};