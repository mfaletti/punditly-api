use pd;
db.createCollection('teams');

var teams = [
	{"name": "Chelsea","park":"Stamford Bridge","logo":""},
	{"name": "Arsenal","park":"Emirates Stadium","logo": ""},
	{"name": "Manchester United","park":"Old Trafford","logo":""},
	{"name": "Manchester City","park":"Etihad","logo":""},
	{"name": "Liverpool","park":"Anfield","logo":""},
	{"name": "Everton","park":"Goodison Park","logo":""},
	{"name": "Tottenham","park":"White Hart Lane","logo":""}
];

for (var i=0; i < teams.length; i++) {
	var team = teams[i];
	team._id = new ObjectId();
	team.id = team._id.valueOf();
	db.teams.insert(team);
}