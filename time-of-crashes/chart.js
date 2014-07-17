(function() {
	charter = {}; // namespace
	charter.days = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	];
	charter.hours = [
		"Midnight to 2:59 a.m.",
		"3 a.m. to 5:59 a.m.",
		"6 a.m. to 8:59 a.m.",
		"9 a.m. to 11:59 a.m.",
		"Noon to 2:59 p.m.",
		"3 p.m. to 5:59 p.m.",
		"6 p.m. to 8:59 p.m.",
		"9 p.m. to 11:59 p.m.",
		"Unknown",
		"Total"
	]

	var container = d3.select('#chart_area');

	var margin = {top: 20, right: 50, bottom: 30, left: 40},
	    width = parseInt(container.style('width')) - margin.left - margin.right,
	    height =parseInt(container.style('height')) - margin.top - margin.bottom;

	var transitionDuration = 400;

	var canvas = d3.select('#chart_area')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	charter.go = function(dataset) {

		// Data manipulation
		var series = d3.nest()
			.key(function(d) { return d.year; })
			.sortValues(function(a, b) {
				d = charter.days;
				h = charter.hours;
				if (d.indexOf(a.weekday) == d.indexOf(b.weekday)) {
					return h.indexOf(a.hour) > h.indexOf(b.hour);
				} else {
					return d.indexOf(a.weekday) > d.indexOf(b.weekday);
				}
			})
			.entries(dataset);

		// Scales
		var xDays = d3.scale.ordinal()
			.domain(d3.range(7))
			.rangeBands([0, width]);
		var xHours = d3.scale.ordinal()
			.domain(d3.range(10))
			.rangeBands([0, (width-50)/charter.days.length], 0.1, 1);
		var y = d3.scale.linear()
			.domain([0, 2000])
			.range([height, 0]);

		var years = canvas.selectAll('.year').data([series[0]]).enter()
			.append('g').attr('class', 'year');
		years.selectAll('.bar').data(function(d) {
			return d.values.filter(function(dd) { return dd.hour != 'Total'; });
		}).enter()
			.append('rect')
			.attr({
				'class': 'bar',
				'x': function(dd) {
					var xd = xDays(charter.days.indexOf(dd.weekday));
					var xh = xHours(charter.hours.indexOf(dd.hour));
					return xd + xh;
				},
				'y': function(dd) { return y(dd.crashes); },
				'height': function(dd) { return height - y(dd.crashes); },
				'width': xHours.rangeBand(),
			});
	}

})();
