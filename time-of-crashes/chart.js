(function() {
	charter = {}; // namespace
	charter.minYear = 1994;
	charter.maxYear = 2012;
	charter.year = 2013;
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
		// "Total"
	]

	charter.colors = [
		'#4C3A48',
		'#Af858F',
		'#FFC8B3',
		'#EAD099',
		'#DBB258',
		'#EF9051',
		'#963530',
		'#302D3D',
		'#666666',
	]

	var userCoordWidth = 2000, userCoordHeight = 1000;

	var margin = {top: 20, right: 80, bottom: 150, left: 100},
	    width = userCoordWidth - margin.left - margin.right,
	    height = userCoordHeight  - margin.top - margin.bottom;

	var transitionDuration = 400;

	var canvas = d3.select('#chart_area')
		.insert('svg', 'div')
		.attr('viewBox', '0 0 ' + userCoordWidth + ' ' + userCoordHeight)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Chart elements
	var series = []
	var xDays = d3.scale.ordinal();
	var xHours = d3.scale.ordinal();
	var x = [xDays, xHours];
	var y = d3.scale.linear();
	var c = d3.scale.ordinal()
		.range(charter.colors)
		.domain(charter.hours);
	var xDaysAxis = d3.svg.axis();
	var xHoursAxis = d3.svg.axis();
	var xAxis = [xDaysAxis, xHoursAxis];
	var yAxis = d3.svg.axis();

	function setScaleParams() {
		xDays
			.domain(d3.range(charter.days.length))
			.rangeBands([0, width]);
		xHours
			.domain(d3.range(charter.hours.length))
			.rangeBands([0, (width-50)/charter.days.length], 0.1, 1);
		y
			.domain([0, 1700])
			.range([height, 0]);
	}

	function invertScale() {
		x = [x[1], x[0]];
		x[0].rangeBands([0, width]);
		x[1].rangeBands([0, (width-50)/x[0].domain().length], 0.1, 1);
		xAxis = [xAxis[1], xAxis[0]];
	}

	function setAxisParams() {
		xDaysAxis
			.scale(xDays)
			.orient('bottom');
		xHoursAxis
			.scale(xHours)
			.orient('bottom');
		if (xAxis.indexOf(xDaysAxis) === 0) {
			xDaysAxis.tickFormat(function(i) { return charter.days[i]; });
			xHoursAxis.tickFormat(function(i) { return i; });
		} else {
			xDaysAxis.tickFormat(function(i) { return charter.days[i][0]; });
			xHoursAxis.tickFormat(function(i) {
				return charter.hours[i];
			});
		}
		xAxis[0].outerTickSize(0);
		xAxis[1].outerTickSize(1);
		yAxis
			.scale(y)
			.outerTickSize(1)
			.innerTickSize(-width)
			.orient('left');
	}

	function getCurrentSeries() {
		return series[charter.year - charter.minYear];
	}

	function drawXAxis() {
		var xap = canvas.selectAll('.x.axis.secondary').data(x[0].domain());
		xap.enter().append('g');
		xap.exit().remove();
		xap.attr({
			'class': 'x axis secondary',
			'transform': function(d, i) {
				return 'translate(' + i*x[0].rangeBand() + ',' + height + ')';
			}
		}).call(xAxis[1]);
		var xas = canvas.selectAll('.x.axis.primary').data([x[0].domain()]);
		xas.enter().append('g');
		xas.attr({
			'class': 'x axis primary',
			'transform': 'translate(0,' + (height+30) +  ')',
		}).call(xAxis[0]);
		var xswap = canvas.selectAll('.x.axis.swap').data([1]);
		xswap.enter().append('path');
		xswap.attr({
			'd': 'M 10 0 L 20 10 L 0 10 L 10 0 M 0 15 L 20 15 L 10 25 Z',
			'class': 'x axis swap',
			'transform': 'translate(' + width + ', ' + (height + 25) + ')',
		});
	}

	function drawYAxis() {
		canvas.append('g')
			.attr({
				'class': 'y axis',
			}).call(yAxis);
		canvas.selectAll('.y.axis text').attr('transform', 'translate(-10,0)');
		canvas.select('.y.axis .tick line').remove();
	}

	function drawSeries() {

		function xTotal(dd) {
			var xd = xDays(charter.days.indexOf(dd.weekday));
			var xh = xHours(charter.hours.indexOf(dd.hour));
			return xd + xh;
		}

		var data = canvas.selectAll('.year').data([getCurrentSeries()]);
		data.enter().append('g').attr('class', 'year');
		data = data.selectAll('.datum').data(function(d) {
				return d.values.filter(function(dd) {
					return dd.hour != 'Total';
				});
			});
		var newData = data.enter().append('g').attr('class', 'datum');
		newData.append('rect')
			.attr({
				'class': 'bar',
				'fill': function(dd) { return c(dd.hour); },
			})
		newData.append('line').attr('class', 'minmax')
		newData.append('rect').attr('class', 'quartile');

		data.transition()
			.duration(transitionDuration)
			.attr('transform', function(dd) {
				return 'translate(' + xTotal(dd) + ',0)';
			});
		data.select('.bar').transition()
			.duration(transitionDuration)
			.attr({
				'y': function(d) { return y(d.crashes); },
				'height': function(d) { return height - y(d.crashes); },
				'width': x[1].rangeBand(),
			});
		data.select('.minmax').transition()
			.duration(transitionDuration)
			.attr({
				'x1': function(dd) { return x[1].rangeBand()/2; },
				'x2': function(dd) { return x[1].rangeBand()/2; },
				'y1': function(dd) { return y(dd.min || 0); },
				'y2': function(dd) { return y(dd.max || 0); },
			});
		data.select('.quartile').transition()
			.duration(transitionDuration)
			.attr({
				'x': function(dd) { return x[1].rangeBand() * 0.25; },
				'y': function(dd) { return y(dd.q3 || 0); },
				'width': function(dd) { return x[1].rangeBand() * 0.5; },
				'height': function(dd) { return y(dd.q1 || 0) - y(dd.q3 || 0); },
			});
		d3.select('#year_switcher > #year').text(getCurrentSeries().key);
	}

	function drawYearSwitcher() {
		var ys = canvas.selectAll('#year_switcher').data([charter.year]);
		ys.enter().append('g');
	}

	function setup() {
		setScaleParams();
		setAxisParams();
	}

	function draw() {
		drawXAxis();
		drawYAxis();
		drawSeries();
	}

	function setCallbacks() {
		d3.select('#year_switcher > #prev').on('click', function() {
			changeYear(false);
		});
		d3.select('#year_switcher > #next').on('click', function() {
			changeYear(true);
		});
		d3.select('.x.axis.swap').on('click', function() {
			invertScale();
			setAxisParams();
			drawXAxis();
			drawSeries();
		});
	}

	charter.go = function(dataset) {

		// Data manipulation
		function weekOrder(a, b) {
			d = charter.days;
			h = charter.hours;
			if (d.indexOf(a.weekday) == d.indexOf(b.weekday)) {
				return h.indexOf(a.hour) > h.indexOf(b.hour);
			} else {
				return d.indexOf(a.weekday) > d.indexOf(b.weekday);
			}
		}

		series = d3.nest()
			.key(function(d) { return d.year; })
			.sortKeys()
			.sortValues(weekOrder)
			.entries(dataset);
		var aggregate = d3.nest()
			.key(function(d) { return d.hour+d.weekday; })
			.rollup(function(leaves) {
				var crashes = leaves
					.map(function(dd) { return dd.crashes; }).sort(d3.ascending);
				return {
					min: d3.min(crashes),
					q1: d3.quantile(crashes, 0.25),
					crashes: d3.median(crashes),
					q3: d3.quantile(crashes, 0.75),
					max: d3.max(crashes),
					weekday: leaves[0].weekday,
					hour: leaves[0].hour,
				}
			})
			.entries(dataset);
		aggregate = aggregate
			.map(function(d) { return d.values; })
			.sort(weekOrder);
		series.push({key: 'Aggregate', values: aggregate});

		setup();
		draw();
		setCallbacks();
	}

	// Callbacks
	function changeYear(next) {
		next = typeof next !== 'undefined' ? next : false;
		if (next && charter.year <= charter.maxYear) {
			charter.year++;
		} else if (!next && charter.year > charter.minYear) {
			charter.year--;
		}
		drawSeries();
	}

})();
