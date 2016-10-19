import chroma from 'chroma-js';

export default function() {

    /**
     * Configurable defaults
     */
    let svg,
        paths,
        width,
        height,
        interpolate = 'cardinal',       // 'cardinal' || 'step-before' || 'monotone' || 'cardinal'
        offset = 'expand';              // 'expand' || 'silhouette'

    function vis(selection) {
        selection.each(function() {
            svg = d3.select(this).append('svg');
        });
    }

    vis.stackData = function(data) {
        let dataset = [],
            stack = d3.layout.stack()
                .offset(offset)
                .values(d => d.intensities)
                .order('reverse');

        data[0].pitches.forEach((pitch, i) => {
            dataset[i] = {
                pitch: 'pitch' + i,
                intensities: []
            };

            data.forEach((datum, j) => {
                let amount = data[j].pitches[i] ? + data[j].pitches[i] : null;

                dataset[i].intensities.push({
                    x: data[j].start,
                    y: amount
                });
            });
        });

        return(stack(dataset));
    }

    vis.draw = function(data) {
        let maxTime = 0,
            dataset = vis.stackData(data),
            xScale = d3.time.scale().range([0, width]),
            yScale = d3.scale.linear().range([0, height]),
            color = chroma.scale(['#023699','#026bad','#0fa5c0','#42b899','#94d275','#d6f36d']).domain([1,0]),
            totals = [],
            area;

        svg.attr({'width': width, 'height': height});

        data.forEach((datum, i) => {
            totals[i] = 0;
            maxTime = data[i].start > maxTime ? data[i].start : maxTime;
            dataset.forEach((datum, j) => {
                let intensity = dataset[j].intensities[i].y;
                totals[i] += intensity;
            });
        });

        yScale.domain([ d3.max(totals), 0 ]);
        xScale.domain([ 0, maxTime]);

        area = d3.svg.area()
            .interpolate(interpolate)
            .x(d => xScale(d.x))
            .y0(d => yScale(d.y0))
            .y1(d => yScale(d.y0 + d.y));

        paths = svg.selectAll('path')
            .data(dataset)
            .enter()
            .append('path')
            .attr({
                class: (d, i) => 'area area' + i,
                d: (d, i) => area(d.intensities),
                fill: (d, i) => color(i / 12).hex(),
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
