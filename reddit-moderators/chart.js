(function() {
	charter = {} // namespace
	charter.subreddits = [
		'funny', 'AdviceAnimals', 'pics', 'aww', 'WTF', 'videos', 'gaming',
		'todayilearned', 'leagueoflegends', 'AskReddit', 'gonewild', 'gifs',
		'worldnews', 'pcmasterrace', 'TrollXChromosomes', '4chan', 'news',
		'trees', 'reactiongifs', 'movies', 'DotA2', 'ImGoingToHellForThis',
		'pokemon', 'politics', 'mildlyinteresting',
	];
	var palette = [
		"#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
		"#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"
	];

	var width = 1000;
	var height = 600;
	var modLineY = height * 0.3;
	var subLineY = height * 0.7;

	var svg = d3.select('#chart_area').append('svg')
		.attr('width', 1200)
		.attr('height', 700)
		.append('g')
		.attr('transform', 'translate(20,20)');

	var dataset = null;
	var moderators = null;
	var subreddits = null;
	var links = []; // moderator - subreddit links
	var moderatorsMatrix = [];
	var subredditsMatrix = [];
	var userScale = d3.scale.ordinal().rangePoints([0, width]);
	var subredditScale = d3.scale.ordinal().rangePoints([0, width]);

	function setLayoutParams() {
		chordLayout.matrix(matrix.map(function(row) {
			return row.map(function(cell) {
				return cell.length;
			});
		})).sortSubgroups(d3.descending);
	}

	function setScaleParams() {
		userScale.domain(moderators.map(function(d) { return d.key; }));
		subredditScale.domain(charter.subreddits);
	}

	function drawModerators() {
		svg.append('g').attr('class','moderators')
			.selectAll('circle')
			.data(moderators).enter()
			.append('circle')
			.attr({
				'cy': modLineY,
				'cx': function(d) { return userScale(d.key); },
				'r': function(d) { return 3.5 * Math.sqrt(d.values.length); },
				// 'fill': function(d,i) { return palette[i%12]; },
			});
	}

	function drawSubreddits() {
		svg.append('g').attr('class','subreddits')
			.selectAll('circle')
			.data(subreddits).enter()
			.append('circle')
			.attr({
				'cy': subLineY,
				'cx': function(d) { return subredditScale(d.key); },
				'r': function(d) { return 3.5 * Math.sqrt(d.values.length); },
				// 'fill': function(d,i) { return palette[i%12]; },
			});
	}

	function drawLinks() {
		svg.append('g').attr('class', 'links')
			.selectAll('line')
			.data(links).enter()
			.append('line')
			.attr({
				'x1': function(d) { return userScale(d.moderator); },
				'y1': modLineY,
				'x2': function(d) { return subredditScale(d.subreddit); },
				'y2': subLineY,
			});
	}

	charter.init = function(dataset) {
		moderators = d3.nest()
			.key(function(d) { return d.name; })
			.entries(dataset)
			.filter(function(d) {
				return d.values.length > 1 && d.key !== 'AutoModerator';
			});
		subreddits = d3.nest()
			.key(function(d) { return d.subreddit; })
			.entries(dataset);

		// Create links
		moderators.forEach(function(d, i) {
			d.values.forEach(function(dd, ii) {
				links.push({'moderator': d.key, 'subreddit': dd.subreddit});
			});
		});
		// Create moderators matrix
		var submoderators = [];
		var s1, s2;
		moderators.forEach(function(m1, i) {
			moderatorsMatrix[i] = [];
			s1 = d3.set(m1.values.map(function(v) { return v.subreddit; }));
			moderators.forEach(function(m2, j) {
				var shared = d3.set([]);
				s2 = d3.set(m2.values.map(function(v) { return v.subreddit; }));
				s1.forEach(function(v) { if (s2.has(v)) shared.add(v); });
				moderatorsMatrix[i][j] = shared;
			});
		});
		setScaleParams();
		drawLinks();
		drawModerators();
		drawSubreddits();
	}

})();
