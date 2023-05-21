function build_plot(graph) {
    // ----------------------------------------
    // Config
    // TEMP: hardcode canvas size
    const width = 900;      // window.innerWidth
    const height = 900;     // window.innerHeight
  
  	const NODE_RADIUS = 5;
  	const TEXT_SIZE = 10;

    // ----------------------------------------
    // Prepare data
    // Fill sources and targets by id to implement d3 naming convention
    graph.links.map(link => link.source = link.source_id);
    graph.links.map(link => link.target = link.target_id);
  	graph.nodes.map(node => node.fx = node.coord_x);
  	graph.nodes.map(node => node.fy = node.coord_y);

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
  
  	console.log(graph);
  
  
    // ----------------------------------------
    // Create the SVG container
    const svg = d3
        .select('#d3_container')
        .attr('width', width)
        .attr('height', height);
  
  	// ----------------------------------------
  	// Zoom
  	// Create a group for the zoomable area
    const zoomGroup = svg.append("g");

    // Create the zoom behavior
    const zoom = d3.zoom()
        //.scaleExtent([0.1, 10]) // [DISABLED]: minimum and maximum zoom levels
        .on("zoom", zoomed);

    // Enable zoom and pan
    svg.call(zoom);

  	// ----------------------------------------
  	// Simulation (create the force simulation)
    const simulation = d3
        .forceSimulation(graph.nodes)
        .force('link', d3.forceLink(graph.links).id((d) => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

    // ----------------------------------------
    // Render
  	const center = zoomGroup
    	.append('g')
    	.attr('transform', (d) => `translate(${width / 2}, ${height / 2})`);
    
    center.append('circle')
  		.attr('r', 200)
    	.attr('fill', '#6ce2ff94')
      .attr('stroke', '#6ce2ff50')
      .attr('stroke-width', 200);
  
    // Render the links
    const link = zoomGroup
        .selectAll('.link')
        .data(graph.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6);

    // Render the nodes
    const node = zoomGroup
        .selectAll('.node')
        .data(graph.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
    		//.attr('fx', (d) => d.fx = d.coord_x)
    		//.attr('fy', (d) => d.fy = d.coord_y)
    		.attr('transform', (d) => `translate(${d.coord_x}, ${d.coord_y})`)
        .call(drag(simulation)); // Enable node drag using the 'drag' function

    node
        .append('circle')
        .attr('r', NODE_RADIUS)
        .attr('fill', '#ccc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

    node
        .append('text')
        .attr('dx', 0)
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
          	console.log(d);
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
  	// Zoomed function to handle zooming and panning
    function zoomed(e) {
        zoomGroup.attr("transform", e.transform);
    }
  
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
// TEMP: solution for manualy create plot without vue

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

function init_d3_plot_off() {
  graph = {
      nodes: [
        {
          active_on: true,
          weight: 44,
          id: 1,
          coord_x: 400.844,
          coord_y: 400.353,
          coord_z: 8.418,
          description: 'entdzhwcmtnz',
          type: 4,
          name: 'some_1',
          time_created: '2023-05-21T14:58:43',
        },
        {
          active_on: true,
          weight: 26,
          id: 2,
          coord_x: 610.844,
          coord_y: 540.353,
          coord_z: 540.252,
          description: 'vqeltlt',
          type: 3,
          name: 'some_2',
          time_created: '2023-05-21T14:58:43',
        },
        {
          active_on: true,
          weight: 26,
          id: 3,
          coord_x: 480.844,
          coord_y: 430.353,
          coord_z: 430.252,
          description: 'vqeltlt',
          type: 3,
          name: 'some_3',
          time_created: '2023-05-21T14:58:43',
        },
        {
          active_on: true,
          weight: 26,
          id: 4,
          fx: 400.844,
          fy: 400.353,
          coord_z: 510.252,
          description: 'vqeltlt',
          type: 3,
          name: 'some_4',
          
          time_created: '2023-05-21T14:58:43',
        },
      ],
      links: [
        {
          source_id: 1,
          active_on: true,
          type: 3,
          description: 'wsjzvtwfno',
          id: 1,
          weight: 45,
          target_id: 2,
          time_created: '2023-05-21T14:58:47',
        },
        {
          source_id: 1,
          active_on: true,
          type: 5,
          description: 'zufmfn ohthiuz',
          id: 2,
          weight: 36,
          target_id: 3,
          time_created: '2023-05-21T14:58:47',
        },
        {
          source_id: 1,
          active_on: true,
          type: 3,
          description: 'bnqungpwx loelf',
          id: 3,
          weight: 25,
          target_id: 45,
          time_created: '2023-05-21T14:58:47',
        },
      ],
    };
  	build_plot(graph);
}