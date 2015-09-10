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
exports.cryptoKey = 'Pund1Tly$';
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/pd'
};