'use strict';

exports = module.exports = function(app, mongoose) {
	var userSchema = new mongoose.Schema({
		name : {type:String,default:null},
		username: {type: String, required: true, trim:true},
		url: {type:String,default:null},
		passwordHash : {type:String,required: true, trim:true},
		email:{type:String, required: true},
		bio: {type:String,default:null},
		created_at: {type: Date, index: true, default: Date.now},
		updated_at: {type: Date, index: true},
		location: {type:String,default:null},
		is_private: {type:Boolean,default:false},
		is_active: {type:Boolean, default:true},
		is_verified: {type:Boolean, default:false},
		profile_image_url: {type:String,default:''},
		followers_count: {type:Number,default:0},
		following_count: {type:Number,default:0},
		phone: {type:String,default:null},
		roles: {type: Array, default: ['user']},
		following:[String]
	});

	userSchema.methods.toJSON = function() {
	  var obj = this.toObject();

		// don't send these props when sending response to client
	  delete obj.passwordHash;
		delete obj.email;
		delete obj.__v;
		delete obj.following;
	  return obj;
	};

	userSchema.statics.encryptPassword = function(password, done) {
		var bcrypt = require('bcryptjs');
		bcrypt.hash(password, 10, done);
	};

	userSchema.statics.findByEmail = function(email, cb){
		return this.findOne({email:email}, cb);
	},

	userSchema.statics.findByUsername = function(username, cb) {
		return this.findOne({username:username}, cb);
	},

	userSchema.statics.validatePassword = function(password, hash, done){
		var bcrypt = require('bcryptjs');
		bcrypt.compare(password, hash, done);
	};

	userSchema.pre('save', function(next){
		this.updated_at = Date.now();
		next();
	});

	app.db.model('User', userSchema, 'users');
};