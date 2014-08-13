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
	
	charter.init = function(dataset) {
		var users = d3.nest()
			.key(function(d) { return d.name; })
			.entries(dataset);
		console.log(users);
	}

})();
