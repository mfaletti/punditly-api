// update uppercase records to lowercase
use pd;

db.teams.find().forEach(function(doc){
	db.teams.update({_id:doc._id}, {$set:{"name":doc.name.toLowerCase(),"park":doc.park.toLowerCase(),"league":doc.league.toLowerCase()}});
});

db.leagues.find().forEach(function(doc){
	db.leagues.update({_id:doc._id}, {$set:{"name":doc.name.toLowerCase(),"country":doc.country.toLowerCase()}});
});