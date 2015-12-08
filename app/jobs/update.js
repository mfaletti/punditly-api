var start = new Date();

/*
 * compute central tendency/summary statistics.
 * find the score with the highest number of observations (mode).
 * using mode instead of mean to protect from influence of outliers i.e data values that are unusual compared to others.
 * for example, if scores array is [1,1,1,2,2,2,2,2,3,3,3], score will be set '2' since it has the highest frequency.
 */
function summarize(doc) {
	var scores = doc.scores;
	if (scores.length == 0) {
   	return null;
	}

	var modeMap = {};
	var maxEl = scores[0], maxCount = 1;

	for (var i = 0; i < doc.total; i++)
	{
   	var el = scores[i];
   	if (modeMap[el] == null) {
   		modeMap[el] = 1;
		} else {
   		modeMap[el]++;
		}

   	if (modeMap[el] > maxCount) {
   		maxEl = el;
   		maxCount = modeMap[el];
		}
	}

	switch (doc.scoring_side) {
		case 'A':
			db.fixtures.update({_id:ObjectId(doc._id)}, {$set:{awayScore:maxEl}});
			break;
		case 'H':
			db.fixtures.update({_id:ObjectId(doc._id)}, {$set:{homeScore:maxEl}});
			break;
		default:
	}
};

// aggregate goal events over the last minute (home and away teams) and update the fixtures collection
// group summary collection by game id and scores.
// after flattening, summary collection should resemble  
// { "_id" : "5521fc4af3b9479f13fa4bd7", "total" : 6, "scores" : [ 3, 3, 3, 2, 2, 3 ], "scoring_side" : "H" }
use pd;

['A','H'].forEach(function(element){

	db.events.aggregate(
		[
			{$match : {created_at: {$gte: new Date(ISODate().getTime() - 1000 * 60 * 1)}}},
			{$match : {type: "goal"}},
			{$match : {'details.scoring_side': element}},
			{$group: {_id: "$gameId", total: {$sum:1}, scores:{$push:"$details.score"}}},
			{$out:"summary"}
		]
	);

	// insert "scoring_side" field in summary collection so we can use this field later to update the fixtures collection.
	db.summary.update({}, {$set:{"scoring_side":element}}, false, true);
	db.summary.find().forEach(summarize);
});

var end = new Date();
var timeDiff = end - start;
timeDiff = timeDiff/1000;
var seconds = Math.round(timeDiff % 60);
timeDiff = timeDiff/Math.round(60);
var minutes = Math.round(timeDiff % 60);

print('Elapsed time: '+ minutes +":"+seconds);