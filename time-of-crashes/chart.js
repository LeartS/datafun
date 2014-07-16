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
	    width = 1024 - margin.left - margin.right,
	    height = 600 - margin.top - margin.bottom;

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
	}

})();
