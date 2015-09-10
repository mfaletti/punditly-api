use pd;
db.createCollection('games');
var games = [
	{
		start: new Date('Sun, 07 April 2014 10:00:00'),
		competition: '120',
		status: 'scheduled',
		homeTeam: '534050854d3aaa735a5ee89e',
		awayTeam: '534050854d3aaa735a5ee89f',
		homeScore: 0,
		awayScore: 0,
		events: {}
	},{
		start: new Date('Sun, 07 April 2014 10:00:00'),
		competition: '120',
		status: 'scheduled',
		homeTeam: '534050854d3aaa735a5ee8a2',
		awayTeam: '534050854d3aaa735a5ee8a3',
		homeScore: 0,
		awayScore: 0,
		events: {}
	},{
		start: new Date('Sun, 14 April 2014 10:00:00'),
		competition: '120',
		status: 'scheduled',
		homeTeam: '534050854d3aaa735a5ee8a4',
		awayTeam: '534050854d3aaa735a5ee8a3',
		homeScore: 0,
		awayScore: 0,
		events: {}
	}
];

for (var i=0; i < games.length; i++) {
	var game = games[i];
	game._id = new ObjectId();
	game.id = game._id.valueOf();
	db.games.insert(game);
}