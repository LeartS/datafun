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

	jesus.plot = function(dataset) {
	}

})();
