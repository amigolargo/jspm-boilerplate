import chroma from 'chroma-js';

d3.test = d3.test || {};

d3.test.stacked = function() {

    /**
     * Configurable defaults
     */
    let svg,
        paths,
        width,
        height,
        compare = 'stocks',             // 'stocks' || 'exchanges' || 'accounts'
        interpolate = 'cardinal',       // 'step-before' || 'monotone' || 'cardinal'
        offset = 'expand';              // 'expand' || 'silhouette'

    function vis(selection) {
        selection.each(function() {
            svg = d3.select(this).append('svg');
        });
    }

    vis.init = function() {
      svg.attr({
        'width': width,
        'height': height,
        'class': 'viz'
      });

      svg.append('text')
        .text(compare)
        .attr({
          fill: '#000',
          x: 0,
          y: 20,
        })

      return this;
    }

    vis.update = function(dataset, quarterHourSegment = 0) {

      const beginMs = +new Date(dataset.data[0].time) + (quarterHourSegment * 900000);
      const endMs = beginMs + 900000;

      console.log(beginMs)
      console.log(endMs)

      const timeSeries = dataset.data.filter((datum) => +new Date(datum.time) > beginMs && +new Date(datum.time) < endMs);

      const maxDate = d3.entries(timeSeries).sort((a, b) => d3.descending(+new Date(a.value.time), +new Date(b.value.time)))[0].value.time;
      const minDate = d3.entries(timeSeries).sort((a, b) => d3.ascending(+new Date(a.value.time), +new Date(b.value.time)))[0].value.time;

      const maxTime = +new Date(maxDate)
      const minTime = +new Date(minDate)

      const maxVolume = d3.entries(timeSeries).sort((a, b) => d3.descending(+a.value.volume, +b.value.volume))[0].value.volume;
      const minVolume = d3.entries(timeSeries).sort((a, b) => d3.ascending(+a.value.volume, +b.value.volume))[0].value.volume;

      const xScale = d3.time.scale().range([0, width]).domain([+new Date(minTime), +new Date(maxTime)]);
      const yScale = d3.time.scale().range([height, 0]);

      const color = chroma.scale('YlGnBu').domain([1,0])

      const comparates = dataset[compare].map((obj) => obj.name)

      const stack = d3.layout.stack()
          .offset('wiggle')
          .values((d) => d.values)
          .x((d) => xScale(d.millis))
          .y((d) => d.volume);

      const seriesData = [];
      const series = {};

      comparates.forEach((name) => {
        series[name] = { name: name, values: [] };
        seriesData.push(series[name]);
      });

      timeSeries.forEach((d) => {
        comparates.map((name) => {
          series[name].values.push({label: d.time, volume: +d.volume, millis: +new Date(d.time)});
        });
      });

      stack(seriesData);

      yScale.domain([0, d3.max(seriesData, (c) => d3.max(c.values, (d) => d.y0 + d.y))]);

      var area = d3.svg.area()
        .interpolate(interpolate)
        .x((d) => xScale(d.millis))
        .y0((d) => yScale(d.y0))
        .y1((d) => yScale(d.y0 + d.y));

      paths = svg.selectAll('path')
          .data(seriesData)
          .enter()
          .append('path')
          .attr({
              class: (d, i) => 'area area' + i,
              d: (d, i) => area(d.values),
              fill: (d, i) => {
                return color(i / comparates.length).hex()
              },
              stroke: 'none'
          });

      return this;
    }

    vis.width = function(arg = width) {
      width = arg;
      return this;
    };

    vis.height = function(arg = height) {
      height = arg;
      return this;
    };

    vis.compare = function(arg = compare) {
      compare = arg;
      return this;
    }

    vis.offset = function(arg = offset) {
      offset = arg;
      return this;
    };

    vis.interpolate = function(arg = interpolate) {
      interpolate = arg;
      return this;
    };

    vis.destroy = function() {
      paths.remove();
      return this;
    };

    return vis;
};

export default d3.test.stacked;
