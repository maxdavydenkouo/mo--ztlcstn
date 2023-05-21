function build_plot(graph) {
    console.log(graph);
    // ----------------------------------------
    // Config
    // TEMP: hardcode canvas size
    const width = 800;      // window.innerWidth
    const height = 750;     // window.innerHeight

    // ----------------------------------------
    // Dummy graph data
    /*
    const graph = {
        nodes: [
            { id: 1, name: 'some_1' },
            { id: 2, name: 'some_2' },
            { id: 3, name: 'some_3' },
        ],
        links: [
            { source_id: 1, target_id: 2 },
            { source_id: 1, target_id: 3 },
            { source_id: 1, target_id: 4 }, // broken link
        ],
    };
    */

    // ----------------------------------------
    // Prepare data
    // Fill sources and targets by id to implement d3 naming convention
    graph.links.map(link => link.source = link.source_id);
    graph.links.map(link => link.target = link.target_id);

    // Remove broken links (which has no associated nodes)
    function remove_broken_links(graph) {
        var nodes_ids = graph.nodes.map(node => node.id);
        var valid_links = graph.links.filter(link => 
            nodes_ids.includes(link.source_id) && 
            nodes_ids.includes(link.target_id)
        )
        return valid_links;
    }

    graph.links = remove_broken_links(graph);

    // ----------------------------------------
    // Create the SVG container
    const svg = d3
        .select('#d3_container')
        .attr('width', width)
        .attr('height', height);

    // Create the force simulation
    const simulation = d3
        .forceSimulation(graph.nodes)
        .force('link', d3.forceLink(graph.links).id((d) => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

    // ----------------------------------------
    // Render
    // Render the links
    const link = svg
        .selectAll('.link')
        .data(graph.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6);

    // Render the nodes
    const node = svg
        .selectAll('.node')
        .data(graph.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(drag(simulation)); // Enable node drag using the 'drag' function

    node
        .append('circle')
        .attr('r', 10)
        .attr('fill', '#ccc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

    node
        .append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text((d) => d.name);

    // ----------------------------------------
    // Define the drag behavior
    function drag(simulation) {
        function dragStarted(event, d) {
            if (!event.active)
            simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        // Remember the position after dragging
        function dragEnded(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = d.x;
            d.fy = d.y;
        }

        return d3
            .drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded);
    }

    // ----------------------------------------
    // Update node and link positions on each tick of the simulation
    simulation.on('tick', () => {
        link
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

        node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });

    // ----------------------------------------
    // popup [look to README wish list for svg popup form solution reference]
    // Create a popup window
    // const popup = d3
    // .select('body')
    // .append('div')
    // .attr('class', 'popup')
    // .style('opacity', 0);
    
    // // Show the popup on node hover
    // node.on('mouseover', (event, d) => {
    //     console.log('popup');
    //     popup
    //         .transition()
    //         .duration(200)
    //         .style('opacity', 1)
    //         .text(d.id)
    //         .style('left', `${event.pageX}px`)
    //         .style('top', `${event.pageY}px`);
    // });

    // // Hide the popup on node mouseout
    // node.on('mouseout', () => {
    // popup
    //     .transition()
    //     .duration(200)
    //     .style('opacity', 0);
    // });
}

// -------------------------------------------------
// TEMP: sulution for manualy create plot without vue
function init_d3_plot() {
    const graph = {};
    d3.json('http://localhost:8000/api/nodes').then(
    function (data) {
        graph.nodes = data.payload;
        d3.json(
        'http://localhost:8000/api/links'
        ).then(function (data) {
        graph.links = data.payload;
        build_plot(graph);
        });
    }
    );
}