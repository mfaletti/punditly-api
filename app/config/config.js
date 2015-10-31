'use strict';

var cfg = {
  dev: {
		AWS_BUCKET:"cdn.punditly.com",
		AWS_CLOUDFRONT_URL:""
	},
	staging:{},
  production: {
		AWS_BUCKET:"cdn.punditly.com",
		AWS_CLOUDFRONT_URL:""
	}
};

exports.config = function() {
  var node_env = process.env.NODE_ENV || 'dev';
  return cfg[node_env];
};

exports.port = process.env.PORT || 8001;
exports.env = process.env.NODE_ENV || 'dev';
exports.cryptoKey = process.env.CRYPTO_KEY || 'Pund1Tly$';
exports.jwt_secret = process.env.JWT_SECRET || 'Pund1tly';
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/pd'
};