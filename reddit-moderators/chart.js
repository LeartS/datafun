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
	var container = d3.select('#chart_area');
	var width = 1920;
	var height = 1080;
	var modLineY = height * 0.3;
	var subLineY = height * 0.7;

	var svg = d3.select('#chart_area').append('svg')
		.attr('viewBox', '0 0 ' + width + ' ' + height)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.append('g')
		.attr('transform', 'translate(0,50)');

	var dataset = null;
	var moderators = null;
	var subreddits = null;
	var links = []; // moderator - subreddit links
	var modLinks = []; // moderator - moderator links
	var subLinks = [];
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

	function drawModLinks() {
		var modLinksArcGenerator = function(modLink) {
			var x1 = userScale(modLink.m1);
			var x2 = userScale(modLink.m2);
			var y = modLineY;
			var pathString = ""
			pathString += 'M ' + x1 + ' ' + y + ' ';
			// rx 10, ry 6 is an hack: the x radius is too small for any pair of
			// points. Therefore, according to
			// http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
			// the ellipse will be scaled up uniformly until big enough.
			// This assures all ellipses will have the same eccentricity without
			// the need to calculate rx and ry from the points coordinates.
			pathString += 'A 10 4 0 0 1 ' + x2 + ' ' + y;
			return pathString;
		};

		svg.append('g').attr('class', 'modlinks')
			.selectAll('path')
			.data(modLinks).enter()
			.append('path')
			.attr('d', modLinksArcGenerator);
	}

	function drawSubLinks() {
		var subLinksArcGenerator = function(subLink) {
			var x1 = subredditScale(subLink.r1);
			var x2 = subredditScale(subLink.r2);
			var y = subLineY;
			var pathString = ""
			pathString += 'M ' + x1 + ' ' + y + ' ';
			// rx 10, ry 6 is an hack: the x radius is too small for any pair of
			// points. Therefore, according to
			// http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
			// the ellipse will be scaled up uniformly until big enough.
			// This assures all ellipses will have the same eccentricity without
			// the need to calculate rx and ry from the points coordinates.
			pathString += 'A 10 4 0 0 0 ' + x2 + ' ' + y;
			return pathString;
		};

		svg.append('g').attr('class', 'sublinks')
			.selectAll('path')
			.data(subLinks).enter()
			.append('path')
			.attr('d', subLinksArcGenerator);
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
		// Create moderator links
		var s1, s2, m1, m2, r1, r2, shared;
		for (var i = 0; i < moderators.length; i++) {
			m1 = moderators[i];
			s1 = d3.set(m1.values.map(function(v) { return v.subreddit; }));
			for (var j = i+1; j < moderators.length; j++) {
				m2 = moderators[j];
				s2 = d3.set(m2.values.map(function(v) { return v.subreddit; }));
				shared = [];
				s1.forEach(function(sub) { if (s2.has(sub)) shared.push(sub); });
				if (shared.length > 0) {
					modLinks.push({'m1': m1.key, 'm2': m2.key, 'subs': shared});
				}
			}
		}
		// Create sublinks
		for (var i = 0; i < subreddits.length; i++) {
			r1 = subreddits[i];
			s1 = d3.set(r1.values.map(function(v) { return v.name; }));
			s1.remove('AutoModerator');
			for (var j = i+1; j < subreddits.length; j++) {
				r2 = subreddits[j];
				s2 = d3.set(r2.values.map(function(v) { return v.name; }));
				shared = [];
				s1.forEach(function(sub) { if (s2.has(sub)) shared.push(sub); });
				if (shared.length > 0) {
					subLinks.push({'r1': r1.key, 'r2': r2.key, 'mods': shared});
				}
			}
		}
		console.log(subLinks);
		setScaleParams();
		drawLinks();
		drawModLinks();
		drawSubLinks();
		drawModerators();
		drawSubreddits();
	}

})();
