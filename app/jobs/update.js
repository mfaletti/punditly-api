var start = new Date();

/*
 * compute summary statistics.
 * find the score with the highest number of occurence (mode).
 * using mode instead of mean to protect from influence of outliers i.e data values that are unusual compared to others.
 */
function mode(doc) {
	var array = doc.scores;
	if (array.length == 0) {
   	return null;
	}

	var modeMap = {};
	var maxEl = array[0], maxCount = 1;

	for (var i = 0; i < array.length; i++)
	{
   	var el = array[i];
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
			db.games.update({_id:ObjectId(doc._id)}, {$set:{awayScore:maxEl}});
			break;
		case 'H':
			db.games.update({_id:ObjectId(doc._id)}, {$set:{homeScore:maxEl}});
			break;
		default:
	}
};

use pd;

// aggregate "goal" events over the last minute (home and away teams)
['A','H'].forEach(function(element){
	db.summary.remove({});

	db.events.aggregate(
		[
			{$match : {created_at: {$lte: new Date(new Date().valueOf() - 60000)}}},
			{$match : {type: "goal"}},
			{$match : {'details.scoring_side': element}},
			{$group: {_id: "$gameId", total: {$sum:1}, scores:{$push:"$details.score"}}},
			{$out:"summary"}
		]
	);

	// insert "scoring_side" field in summary collection so we can use this field later to update the game collection.
	db.summary.update({}, {$set:{"scoring_side":element}}, false, true);
	db.summary.find().forEach(mode);
});

var end = new Date();
var timeDiff = end - start;
timeDiff = timeDiff/1000;
var seconds = Math.round(timeDiff % 60);
timeDiff = timeDiff/Math.round(60);
var minutes = Math.round(timeDiff % 60);

print('Elapsed time: '+ minutes +":"+seconds);