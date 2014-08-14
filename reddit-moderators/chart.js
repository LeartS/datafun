(function() {
	charter = {} // namespace
	charter.subreddits = [
		'funny',
		'AdviceAnimals',
		'pics',
		'aww',
		'WTF',
		'videos',
		'gaming',
		'todayilearned',
		'leagueoflegends',
		'AskReddit',
		'gonewild',
		'gifs',
		'worldnews',
		'pcmasterrace',
		'TrollXChromosomes',
		'4chan',
		'news',
		'trees',
		'reactiongifs',
		'movies',
		'DotA2',
		'ImGoingToHellForThis',
		'pokemon',
		'politics',
		'mildlyinteresting',
	];

	var dataset = null;
	var matrix = [];
	var chordLayout = d3.layout.chord()

	function setLayoutParams() {
		chordLayout.matrix(matrix.map(function(row) {
			return row.map(function(cell) {
				return cell.length;
			});
		}));
	}

	charter.init = function(dataset) {
		var users = d3.nest()
			.key(function(d) { return d.name; })
			.entries(dataset);
		console.log(users);
		for (var i = 0; i < charter.subreddits.length; i++) {
			matrix[i] = new Array(charter.subreddits.length);
			for (var j = 0; j < charter.subreddits.length; j++) {
				matrix[i][j] = [];
			}
		}
		users.filter(function(d) { return d.values.length > 1; })
			.forEach(function(d) {
				for (var i = 0; i < d.values.length; i++) {
					for (var j = i+1; j < d.values.length; j++) {
						var s1 = charter.subreddits.indexOf(d.values[i].subreddit);
						var s2 = charter.subreddits.indexOf(d.values[j].subreddit);
						matrix[s1][s2].push(d.values[0].name);
						matrix[s2][s1].push(d.values[0].name);
					}
				}
			});
		setLayoutParams();
	}

})();
