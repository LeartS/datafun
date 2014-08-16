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
	var palette = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99",
	               "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a",
	               "#ffff99", "#b15928"];

	var svg = d3.select('#chart_area').append('svg')
		.attr('width', 1000)
		.attr('height', 700)
		.append('g')
		.attr('transform', 'translate(500,350)');

	var dataset = null;
	var matrix = [];
	var chordLayout = d3.layout.chord()
	var arcGenerator = d3.svg.arc().innerRadius(300).outerRadius(350);
	var chordGenerator = d3.svg.chord().radius(300);

	function setLayoutParams() {
		chordLayout.matrix(matrix.map(function(row) {
			return row.map(function(cell) {
				return cell.length;
			});
		})).sortSubgroups(d3.descending);
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
				if (i === j) { matrix[i][j] = new Array(20); }
			}
		}
		users.filter(function(d) { return d.values.length > 1; })
			.forEach(function(d) {
				if (d.key === 'AutoModerator') { return; }
				for (var i = 0; i < d.values.length; i++) {
					var s1 = charter.subreddits.indexOf(d.values[i].subreddit);
					for (var j = i+1; j < d.values.length; j++) {
						var s2 = charter.subreddits.indexOf(d.values[j].subreddit);
						matrix[s1][s2].push(d.values[0].name);
						matrix[s2][s1].push(d.values[0].name);
					}
				}
			});
		setLayoutParams();
		console.log(chordLayout.matrix());
		var cc = chordLayout.chords().filter(function(chord) {
			return chord.target.index !== chord.source.index;
		});
		svg.append('g')
			.selectAll('g')
			.data(chordLayout.groups)
			.enter()
			.append('path')
			.attr('d', function(d) { return arcGenerator(d); })
			.style('fill', function(d,i) { return palette[i%12]; });
		svg.append('g').attr('class', 'chord')
			.selectAll('.path')
			.data(cc).enter()
			.append('path')
			.attr('fill', function(d) { return palette[d.source.index]; })
			.attr('opacity', 0.8)
			.attr('d', chordGenerator);
		console.log(chordLayout.chords());
	}

})();
