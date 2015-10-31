'use strict';

var
	bcrypt = require('bcryptjs')
	,fs = require('fs')
	,formidable = require('formidable')
	,AWS = require('aws-sdk')
	,mime = require('mime')
	,async = require('async');

exports.read = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	// return information about a user
	var id = req.params.id;

	if (!req.app.db.models.User.isValid(req.params.id)) { // make sure it's a valid objectid
		return workflow.emit('not_found', 'INVALID_USER_ID');
	}

	req.app.db.models.User.findById(id, function(err,person){
		if (err) {
			return next(err);
		} else if (!person) {
			return workflow.emit('not_found');
		} else {
			res.send(JSON.stringify(person));
		}
	});
};
 
/**
 * POST account/settings
 * Updates the authenticating user's accounts settings.
 */
exports.settings = function(req, res, next) {
	res.send(200);
};

/**
 * POST account/profile
 * updates the properties of the authenticating user's account.
 * Only parameters specified will be updated.
 */
exports.profile = function(req, res, next){
	var workflow = req.app.util.workflow(req, res);
	req.app.db.models.User.findById(req.signedCookies['user_id'], function(err, person){
		if (err) {
			return next(err);
		} else if (person === null) {
			return workflow.emit('not_found');
		} else {
			var doEdit = function(key, cb){
				person[key] = req.body[key] || person[key];
				return cb(null);
			};

			var editable = ['name', 'bio', 'location', 'url'];
			async.each(editable, doEdit, function(err){
				if (!err) {
					person.save(function(e, data){
						res.send(JSON.stringify(data));
					});
				}
			});
		}
	});
};

/**
 * POST account/profile_image
 * update profile image for the authenticating user.
 */
exports.profile_image = function(req, res, next){
	req.app.db.models.User.findById(req.signedCookies['user_id'],function(err,user){
		if (err) {
			res.send(500);
		} else if (user === null) {
			res.send(404, {response:{status:404},error: {message:"UserNotFound"}});
		} else {
			var form = new formidable.IncomingForm();
			form.keepExtensions = true;
			form.type = 'multipart';
			var MAX_UPLOAD_SIZE = 700 * 1024; //700K
			var fileinfo;

			form
			.on('end', function(){
				if (!fileinfo) {
					return;
				}

				// validate mime type. not relieable since we're depending on value as set by the client
				var allowedFileTypes = ['image/png','image/jpeg'];
				if (_.contains(allowedFileTypes, fileinfo.type) === false) {
					res.set("Connection", "close");
					res.send(400,{response:{status:400},error:{message:'Invalid image type'}});
					res.end();

					// delete image
					fs.unlink(fileinfo.path, function (err) {
						if (err) {
							console.log(err);
						}
					});

					return;
				}

				fs.readFile(fileinfo.path,function(err,data) {
					var bucket = app.get('config').AWS_BUCKET;
					var s3bucket = new AWS.S3({params:{Bucket:bucket}});
					s3bucket.putObject({Key:'profile_images/' + user.id + '/' + fileinfo.name,Body:data,ACL:'public-read', ContentType:fileinfo.type},function(err,d){
						if (err) {
							res.send(500,{response:{status:500},error:{message:err.message}});
							return;
						} else {
							user.profile_image_url = 'https://s3.amazonaws.com/cdn.punditly.com/profile_images/' + user.id + '/' + fileinfo.name;
							user.save(function(err,p){
								res.send(200, {response:{status:200},data:p});
							});

							// delete the file from temp folder
							fs.unlink(fileinfo.path, function (err) {
								if (err) {
									console.log('Error deleting' + fileinfo.path);
								}
							});
						}
					});
				});
			})
			.on('file', function(name,file){
				if (req.get('Content-Length') > MAX_UPLOAD_SIZE || form.bytesExpected > MAX_UPLOAD_SIZE) {
					res.set("Connection", "close");
					res.send(413,{response:{status:413},error:{message:'File is too big'}});
					res.end();

					// delete image
					fs.unlink(file.path, function (err) {});

					return;
				}

				fileinfo = file;
			})
			.on('error',function(err){
				res.send(500,{response:{status:500},error:{message:'Server Error'}});
			})
			.on('progress', function(bytesReceived,bytesExpected){

			});

			form.parse(req,function(err,fields,files){

			});
		}
	});
};

/*app.get('/1/account/image', function(req,res){
	var form = "<!DOCTYPE HTML><html><body>" +
	"<form method='post' action='/1/account/profile_image' enctype='multipart/form-data'>" +
	"<input type='file' name='image'/>" +
	"<input type='submit' /></form>" +
	"</body></html>";

	res.writeHead(200, {'Content-Type': 'text/html' });
	res.end(form);
});*/