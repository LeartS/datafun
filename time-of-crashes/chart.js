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

	// independent of screen size
	var userCoordWidth = 2000, userCoordHeight = 1000;
	var mainHeightPerc = 0.80;
	var mainHeight = Math.floor(userCoordHeight * mainHeightPerc);
	// yc = Year Chooser; mc = Main Chart
	var mcMargin = {top: 20, right: 80, bottom: 80, left: 100};
	var ycMargin = {top: 0, right: 80, bottom: 30, left: 100};
	var mcHeight = mainHeight - mcMargin.top - mcMargin.bottom;
	var ycHeight = userCoordHeight - mainHeight  - ycMargin.top - ycMargin.bottom;
	var mcWidth = userCoordWidth - mcMargin.left - mcMargin.right;
	var ycWidth = userCoordWidth - ycMargin.left - ycMargin.right;

	var transitionDuration = 400;

	var canvas = d3.select('#chart_area')
		.insert('svg', 'div')
		.attr('viewBox', '0 0 ' + userCoordWidth + ' ' + userCoordHeight)
		.attr('preserveAspectRatio', 'xMidYMid meet');
	var mainChart = canvas.append('g')
		.attr('class', 'main_chart')
		.attr('transform', 'translate(' + mcMargin.left + ',' + mcMargin.top + ')');
	var yearChooser = canvas.append('g')
		.attr('class', 'year_chooser')
		.attr('transform', 'translate(' + ycMargin.left + ',' + (mainHeight + ycMargin.top) + ')');

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

	function drawYearChooser() {
		ycXScale = d3.scale.ordinal()
			.domain(d3.range(charter.minYear, charter.maxYear+1))
			.rangeBands([0, ycWidth]);
		ycYScale = d3.scale.linear()
			.domain([25000, 40000])
			.range([ycHeight, 0]);
		ycXAxis = d3.svg.axis()
			.scale(ycXScale)
			.outerTickSize(1)
			.orient('bottom');
		ycYAxis = d3.svg.axis()
			.scale(ycYScale)
			.ticks(4)
			.outerTickSize(1)
			.orient('left');
		var line = d3.svg.line()
			.x(function(d) { return ycXScale(+d.key) + ycXScale.rangeBand()/2; })
			.y(function(d) {
				return ycYScale(d.values.filter(function(dd) {
					return dd.hour === 'Total';
				}).reduce(function(sum, value) {
					return sum + value.crashes;
				}, 0));
			});
		yearChooser.append('g').attr('class', 'x axis')
			.attr('transform', 'translate(0,' + ycHeight + ')').call(ycXAxis);
		yearChooser.append('g').attr('class', 'y axis').call(ycYAxis);
		drawYearChooserIndicator();
		yearChooser.append('g').selectAll('rect.selector')
			.data(series.slice(0, series.length-1)).enter().append('rect')
			.attr({
				'class': 'selector',
				'width': ycXScale.rangeBand(),
				'height': ycHeight,
				'x': function(d) { return ycXScale(+d.key); },
				'y': 0,
			});
		yearChooser.datum(series.slice(0,series.length-1)).append('path')
			.attr('class', 'data')
			.attr('d', function(d) { return line(d); });
	}

	function drawYearChooserIndicator() {
		var indicator = yearChooser.selectAll('rect.indicator').data([1]);
		indicator.enter().append('rect')
			.attr({
				'class': 'indicator',
				'height': ycHeight,
			});
		indicator.transition()
			.duration(transitionDuration)
			.attr({
				'x': charter.year === 2013 ? 0 : ycXScale(charter.year),
				'y': 0,
				'width': charter.year === 2013 ? ycWidth : ycXScale.rangeBand(),
			});
	}

	function setScaleParams() {
		xDays
			.domain(d3.range(charter.days.length))
			.rangeBands([0, mcWidth]);
		xHours
			.domain(d3.range(charter.hours.length))
			.rangeBands([0, (mcWidth-50)/charter.days.length], 0.1, 1);
		y
			.domain([0, 1700])
			.range([mcHeight, 0]);
	}

	function invertScale() {
		x = [x[1], x[0]];
		x[0].rangeBands([0, mcWidth]);
		x[1].rangeBands([0, (mcWidth-50)/x[0].domain().length], 0.1, 1);
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
			.innerTickSize(-mcWidth)
			.orient('left');
	}

	function getCurrentSeries() {
		return series[charter.year - charter.minYear];
	}

	function drawXAxis() {
		var xap = mainChart.selectAll('.x.axis.secondary').data(x[0].domain());
		xap.enter().append('g');
		xap.exit().remove();
		xap.attr({
			'class': 'x axis secondary',
			'transform': function(d, i) {
				return 'translate(' + i*x[0].rangeBand() + ',' + mcHeight + ')';
			}
		}).call(xAxis[1]);
		var xas = mainChart.selectAll('.x.axis.primary').data([x[0].domain()]);
		xas.enter().append('g');
		xas.attr({
			'class': 'x axis primary',
			'transform': 'translate(0,' + (mcHeight+30) +  ')',
		}).call(xAxis[0]);
		var xswap = mainChart.selectAll('.x.axis.swap').data([1]);
		xswap.enter().append('path');
		xswap.attr({
			'd': 'M 10 0 L 20 10 L 0 10 L 10 0 M 0 15 L 20 15 L 10 25 Z',
			'class': 'x axis swap',
			'transform': 'translate(' + mcWidth + ', ' + (mcHeight + 25) + ')',
		});
	}

	function drawYAxis() {
		mainChart.append('g')
			.attr({
				'class': 'y axis',
			}).call(yAxis);
		mainChart.selectAll('.y.axis text').attr('transform', 'translate(-10,0)');
		mainChart.select('.y.axis .tick line').remove();
	}

	function drawSeries() {

		function xTotal(dd) {
			var xd = xDays(charter.days.indexOf(dd.weekday));
			var xh = xHours(charter.hours.indexOf(dd.hour));
			return xd + xh;
		}

		var data = mainChart.selectAll('.year').data([getCurrentSeries()]);
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
				'height': function(d) { return mcHeight - y(d.crashes); },
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
		d3.select('body').on('keyup', function(d) {
			if (d3.event.keyCode == 37) {        // Left arrow
				setYear(charter.year-1);
			} else if (d3.event.keyCode == 39) { // Right arrow
				setYear(charter.year+1);
			} else if (d3.event.keyCode == 83) { // s
				d3.select('.x.axis.swap').on('click')();
			}
		});
		d3.select('.x.axis.swap').on('click', function() {
			invertScale();
			setAxisParams();
			drawXAxis();
			drawSeries();
		});
		yearChooser.selectAll('rect.selector').on('click', function(d) {
			setYear(+d.key === charter.year ? 2013 : +d.key);
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
		drawYearChooser();
		draw();
		setCallbacks();
	}

	// Callbacks
	function setYear(year) {
		if (year >= charter.minYear && year <= charter.maxYear + 1) {
			charter.year = year;
			drawSeries();
			drawYearChooserIndicator();
		}
	}

})();
