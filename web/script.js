const { createApp } = Vue

createApp({
    data() {
        return {
            graph: {
                nodes: [],
                links: [],
            },
            node_edit: {
                id: null,
                is_active: null,
                type: null,
                weight: null,
                name: null,
                coord_x: null,
                coord_y: null,
                coord_z: null,
                description: null,
                time_created: null,
                is_show: null,
            },
            link_edit: {
                id: null,
                is_active: null,
                type: null,
                weight: null,
                source_id: null,
                target_id: null,
                description: null,
                time_created: null,
                is_show: null,
            },
            is_payload_exists: false,
            error_message: "",
            error_popup_on: false,
        }
    },
    created() {
        // Vue instance is created
        //let q = new URLSearchParams(window.location.search.substring(1)).get("q");
    },
    mounted() {
        // DOM has been mounted
        this.init_graph();
    },
    methods: {
        async init_graph() {
            this.graph.nodes = await this.get_items('nodes');
            this.graph.links = await this.get_items('links');
            this.build_plot(this.graph);

            // TEMP: fill dummy data
            //this.node_edit = this.graph.nodes[12];
            //this.node_edit.is_show = true;
            //this.link_edit = this.graph.links[23];
            //this.link_edit.is_show = true;
        },
        async get_items(item) {
            // get items by axios request
            let res = await axios.get('api/' + item);
            if (res.data.success == true) {
                return res.data.payload;
            } else {
                // errors
                this.error_message = res.data.description;
                this.error_popup_on = true;
            }
        },
        async build_plot(graph) {
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
        
            // Set coordinates if presented
            graph.nodes.map(node => node.fx = node.coord_x);
            graph.nodes.map(node => node.fy = node.coord_y);
        
            // Init is_changed flag for autosave
            graph.nodes.map(node => node.is_changed = false);
            graph.links.map(link => link.is_changed = false);
        
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
                .select('.d3-container-svg')
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
            // Center distribution
              const center = zoomGroup
                .append('g')
                .attr('transform', (d) => `translate(${width / 2}, ${height / 2})`)
                .append('circle')
                .attr('r', 200)
                .attr('fill', '#00000070')
                .attr('stroke', '#00000030')
                .attr('stroke-width', 200);
          
            // Render the links
            const link = zoomGroup
                .selectAll('.link')
                .data(graph.links)
                .enter()
                .append('line')
                //.attr('class', 'link')
                .attr('stroke', '#777')
                .attr('stroke-opacity', 0.5)
                .on("click", (event, d) => {
                    this.link_edit = d;
                    this.link_edit.is_show = true;
                });

            // Render the nodes
            const node = zoomGroup
                .selectAll('.node')
                .data(graph.nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                //.attr('fx', (d) => d.fx = d.coord_x)
                //.attr('fy', (d) => d.fy = d.coord_y)
                //.attr('transform', (d) => `translate(${d.coord_x}, ${d.coord_y})`)
                .call(drag(simulation)); // Enable node drag using the 'drag' function
        
            node
                .append('circle')
                .attr('r', NODE_RADIUS)
                .attr('fill', '#ccc')
                .attr('stroke', '#fff')
                .attr('stroke-width', 1.5)
                .on("click", (event, d) => {
                    this.node_edit = d;
                    this.node_edit.is_show = true;  
                });
        
            node
                .append('text')
                .attr('dx', 7)
                //.attr('dy', '.35em')
                  .attr('alignment-baseline', 'middle')
                .style('pointer-events', 'none')
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
              // Zoomed function to handle zooming and panning
            function zoomed(e) {
                zoomGroup.attr("transform", e.transform);
            }
        },
        // async save_as_relevant() {
        //     if (this.is_payload_exists == true && this.response.name != "") {
        //     let res = await axios.post('predict/saved?q=' + encodeURIComponent(this.response.name));
        //     if (res.data.meta.success == false) {
        //         this.arise_error(res.data.meta.description);  
        //     } else {
        //         this.response.is_saved = true;
        //         this.response.saved_id = res.data.payload.id;
        //     }
        //     } else {
        //     this.arise_error("can't save item by empty name value");
        //     }
        // },
        arise_error_popup(message) {
            this.error_popup_on = true;
            this.error_message = message;
        },
        close_error_popup() {
            this.error_popup_on = !this.error_popup_on;
            this.error_message = "";
        }
    }
}).mount('#app')