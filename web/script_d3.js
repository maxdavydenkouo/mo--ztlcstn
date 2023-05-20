function build_plot(data) {
    
    config_canvas = {
        width: 250,
        height: 200,
    }
    
    // const DUMMY_DATA = [
    //     {id: 1, value: 10, name: 'some'},
    //     {id: 2, value: 13, name: 'mose'},
    //     {id: 3, value: 31, name: 'abricos'},
    //     {id: 4, value: 37, name: 'roga'},
    //     {id: 5, value: 50, name: 'curaga'}
    // ]
    // const data = DUMMY_DATA

    console.log(data);
    
    const xScale = d3.scaleBand()
        .domain(data.map((dataPoint) => dataPoint.name))
        .rangeRound([0, config_canvas.width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, 60]) // from min to max data value
        .range([config_canvas.height, 0]);

    const container = d3.
        select('.d3_container')
        .attr("width", config_canvas.width)
        .attr("height", config_canvas.height);

    const nodes = container
        .selectAll('.d3_node')
        .data(data)
        .enter()
        .append('rect')
        .classed('d3_node', true)
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => config_canvas.height - yScale(d.value))
        .attr('x', d => xScale(d.name))
        .attr('y', d => yScale(d.value));
}