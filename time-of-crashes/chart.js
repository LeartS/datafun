(function() {
	charter = {}; // namespace
	charter.minYear = 1994;
	charter.maxYear = 2012;
	charter.year = 2012;
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

	var margin = {top: 20, right: 50, bottom: 60, left: 40},
	    width = parseInt(container.style('width')) - margin.left - margin.right,
	    height =parseInt(container.style('height')) - margin.top - margin.bottom;

	var transitionDuration = 400;

	var canvas = d3.select('#chart_area')
		.insert('svg', 'div')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	var dataCanvas = canvas.append('g').attr('class', 'year');

	// Chart elements
	var series = []
	var xDays = d3.scale.ordinal();
	var xHours = d3.scale.ordinal();
	var y = d3.scale.linear();
	var xDaysAxis = d3.svg.axis();
	var xHoursAxis = d3.svg.axis();
	var yAxis = d3.svg.axis();

	function setScaleParams() {
		xDays
			.domain(d3.range(7))
			.rangeBands([0, width]);
		xHours
			.domain(d3.range(10))
			.rangeBands([0, (width-50)/charter.days.length], 0.1, 1);
		y
			.domain([0, 2000])
			.range([height, 0]);
	}

	function setAxisParams() {
		xDaysAxis
			.scale(xDays)
			.tickFormat(function(i) { return charter.days[i];} )
			.outerTickSize(0)
			.orient('bottom');
		xHoursAxis
			.scale(xHours)
			.outerTickSize(1)
			.orient('bottom');
		yAxis
			.scale(y)
			.outerTickSize(1)
			.orient('left');
	}

	function getCurrentSeries() {
		return series[charter.year - charter.minYear];
	}

	function drawXAxis() {
		canvas.selectAll('.x.axis').data(charter.days).enter()
			.append('g')
			.attr({
				'class': 'x axis',
				'transform': function(d, i) {
					return 'translate(' + i*xDays.rangeBand() + ',' + height + ')';
				}
			}).call(xHoursAxis);
		canvas.selectAll('.d.axis').data([charter.days]).enter()
			.append('g')
			.attr({
				'class': 'x axis',
				'transform': 'translate(0,' + (height+30) +  ')',
			}).call(xDaysAxis);
	}

	function drawYAxis() {
		canvas.append('g')
			.attr({
				'class': 'y axis',
				// 'transform': 'translate(' + (width+5) + ',0)',
			}).call(yAxis);
	}

	function drawSeries(update) {
		update = typeof update !== 'undefined' ? update : false;
		var bars = canvas.selectAll('.year').data([getCurrentSeries()])
			.selectAll('.bar').data(function(d) {
				return d.values.filter(function(dd) {
					return dd.hour != 'Total';
				});
			});
		if (!update) {
			bars = bars.enter().append('rect');
		} else {
			bars = bars.transition()
				.duration(transitionDuration)
				.ease('quad-in-out');
		}
		bars.attr({
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
		d3.select('#year_switcher > #year').text(getCurrentSeries().key);
	}

	function setup() {
		setScaleParams();
		setAxisParams();
	}

	function draw() {
		drawSeries();
		drawXAxis();
		drawYAxis();
	}

	function setCallbacks() {
		d3.select('#year_switcher > #prev').on('click', function() {
			changeYear(false);
		});
		d3.select('#year_switcher > #next').on('click', function() {
			changeYear(true);
		});
	}

	charter.go = function(dataset) {
		// Data manipulation
		series = d3.nest()
			.key(function(d) { return d.year; })
			.sortKeys()
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
		console.log(series);
		setup();
		draw();
		setCallbacks();
	}

	// Callbacks
	function changeYear(next) {
		next = typeof next !== 'undefined' ? next : false;
		if (next && charter.year <= charter.maxYear) {
			charter.year++;
		} else if (!next && charter.year >= charter.minYear) {
			charter.year--;
		}
		drawSeries(true);
	}

})();
