module.exports = function(app) {
	app.get('/docs', function(req,res){
		res.render('home');
	});
	
	app.get('/docs/auth', function(req,res){
		res.render('docs/auth');
	});
	
	app.get('/docs/account', function(req,res){
		res.render('docs/account');
	});
	
	app.get('/docs/comments', function(req,res){
		res.render('docs/comment');
	});
	
	app.get('/docs/friendships', function(req,res){
		res.render('docs/friendships');
	});
	
	app.get('/docs/streams', function(req,res){
		res.render('docs/streams');
	});

};