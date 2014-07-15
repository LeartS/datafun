(function() {
	jesus = {}; // namespace
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

	function generateColors(luminance=60, croma=60, offset=0) {
		// http://bl.ocks.org/nitaku/8566245
		var colors = [];
		for (var i = 0; i < 20; i++) {
			colors.push(d3.hcl((i*18+offset)%360, croma, luminance));
		}
		return colors;
	}
	colors = generateColors();

	jesus.plot = function(dataset) {
		var t = d3.map();// {country: 'total', years: []};
		for (var i = 0; i < 34; i++) {
			var yearTotal = 0;
			dataset.forEach(function(d) {
				yearTotal += d.years[i].value;
			});
			t.set(i+1979, yearTotal);
		}
		// console.log(t);
		dataset.sort(function(a, b) {
			if (a.years[a.years.length-1].value > b.years[b.years.length-1].value) {
				return -1;
			} else { return 1; }
		});
		dataset = dataset.slice(0,19);
		// console.log(dataset);
		var yScale = d3.scale.linear()
			.range([height, 0])
			.domain([0, 1]);
		var xScale = d3.scale.linear()
			.range([0, width])
			.domain(d3.extent(dataset[0].years.map(function(d) {
				return d.year;
			})));
		var colorScale = d3.scale.category20c()
			.domain(dataset.map(function(d) { return d.country; }));
		var colorScale2 = d3.scale.ordinal()
			.domain(dataset.map(function(d) { return d.country; }))
			.range(colors);

		var xAxis = d3.svg.axis()
		.scale(xScale)
			.tickFormat(function(d) { return "'"+(d+'').substr(-2,2); })
			.orient('bottom');
		var yAxis = d3.svg.axis()
			.scale(yScale)
			.tickFormat(function(d) { return d*100 + '%'; })
			.orient('right');

		var area = d3.svg.area()
			.x(function(d) { return xScale(d.year); })
			.y0(function(d) { return yScale(d.y0); })
			.y1(function(d) { return yScale(d.y0+d.y); });
		var stack = d3.layout.stack()
			.values(function(d) { return d.years; })
			.offset('zero')
			.x(function(d) { return d.year; })
			.y(function(d) { return d.value/t.get(d.year); });
		// dataset = [dataset[61]];
		// var stacked = stack(dataset);
		// console.log(stacked);

		series = canvas.selectAll('g').data(stack(dataset)).enter().append('g');
		series.append('path')
			.attr('class', 'area')
			.style('fill', function(d) { return colorScale2(d.country); })
		// .style('stroke', function(d) { return colorScale(d.country); })
			.attr('d', function(d) {
				return area(d.years);
			});
		canvas.append('g')
			.attr({
				'class': 'x axis',
				'transform': 'translate(0, ' + (height+5) + ')',
			}).call(xAxis);
		canvas.append('g')
			.attr({
				'class': 'y axis',
				'transform': 'translate(' + (width+5) + ',0)',
			}).call(yAxis);

		var updateStackOffset = function() {
			series = canvas.selectAll('g')
				.data(stack(dataset))
				.selectAll('g path')
				.transition(transitionDuration)
				.attr('d', function(d) {
					return area(d.years);
				});
		}

		var redrawChart = function() {
			allSeries = canvas.selectAll('g').data(stack(dataset));
			allSeries.enter().append('g').append('path')
				.attr('class', 'area')
				.style('fill', function(d) { return colorScale2(d.country); })
				.attr('d', function(d) {
					return area(d.years);
				});
			allSeries.selectAll('path')
				.attr('class', 'area')
				.style('fill', function(d) { return colorScale2(d.country); })
				.attr('d', function(d) {
					return area(d.years);
				});
		}

		d3.select('#controls select').on('change', function(d) {
			stack.offset(this.value);
			updateStackOffset();
		});

		d3.selectAll('#controls input').on('change', function(d) {
			l = +d3.select('#luminance').property('value');
			c = +d3.select('#chroma').property('value');
			o = +d3.select('#offset').property('value');
			colorScale2.range(generateColors(l, c, o));
			redrawChart();
		});

		// d3.selectAll('path.area').on('mouseover', function(d, i) {
		// 	d3.select(this).attr('class', 'selected');
		// }).on('mouseout', function(d, i) {
			// console.log(this);
			// d3.select(this).classed('selected', false);
		// });
	}

})();
