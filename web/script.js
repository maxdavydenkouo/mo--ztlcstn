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
            nodes_index_map: {},
            links_index_map: {},
            is_payload_exists: false,
            error_message: "",
            error_popup_on: false,
            info_message: "",
            info_popup_on: false,
        }
    },
    created() {
        // Vue instance is created
        //let q = new URLSearchParams(window.location.search.substring(1)).get("q");
    },
    mounted() {
        // DOM has been mounted
        this.init();
    },
    methods: {
        async init() {
            this.graph.nodes = await this.get_items('nodes');
            this.graph.links = await this.get_items('links');

            this.init_graph();
        },
        async refresh() {
            // HACK: refactor this shitty realizatoin
            const elements = document.getElementsByClassName("d3-container-svg");
            if (elements.length > 0) {
                elements[0].removeChild(elements[0].lastElementChild);
            }
            this.init_graph();
        },
        async init_graph() {
            // ----------------------------------------
            // Usable data
            // Map node/link id to its index in array for fast search by id
            // Use: graph.nodes[nodes_index_map[id]] = <node object>
            this.graph.nodes.forEach((node, i) => { this.nodes_index_map[node.id] = i; });
            this.graph.links.forEach((node, i) => { this.links_index_map[node.id] = i; });

            this.build_plot(this.graph);
        },
        async get_items(item) {
            // get items by axios request
            let res = await axios.get('api/' + item);
            if (res.data.success == true) {
                return res.data.payload;
            } else {
                this.error_message = res.data.description;
                this.error_popup_on = true;
            }
        },
        async build_plot(graph) {
            // ----------------------------------------
            // Config
            // TEMP: hardcode canvas size
            const WIDTH = 900;      // window.innerWidth
            const HEIGHT = 900;     // window.innerHeight

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
            // HACK: add nodes_index_map as param because can't get it inside function
            function remove_broken_links(graph, nodes_index_map) {
                var valid_links = graph.links.filter(link => 
                    link.source_id in nodes_index_map && 
                    link.target_id in nodes_index_map && 
                    graph.nodes[nodes_index_map[link.source_id]].is_active &&
                    graph.nodes[nodes_index_map[link.target_id]].is_active
                );
                return valid_links;
            }
            graph.links = remove_broken_links(graph, this.nodes_index_map);
          
            // ----------------------------------------
            // Create the SVG container
            const svg = d3
                .select('.d3-container-svg')
                .attr('width', WIDTH)
                .attr('height', HEIGHT);
          
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
                .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2));
        
            // ----------------------------------------
            // Render
            // Center distribution
            // const center = zoomGroup
            //     .append('g')
            //     .attr('transform', (d) => `translate(${WIDTH / 2}, ${HEIGHT / 2})`)
            //     .append('circle')
            //     .attr('r', 200)
            //     .attr('fill', '#00000070')
            //     .attr('stroke', '#00000030')
            //     .attr('stroke-width', 200);
          
            // Render the links
            const link = zoomGroup
                .selectAll('.link')
                .data(graph.links)
                .enter()
                .filter((d) => d.is_active)
                .append('line')
                //.attr('class', 'link')
                .attr('stroke', '#777')
                .attr('stroke-opacity', 0.5)
                .on("click", (event, d) => {
                    this.link_edit = {
                        id: d.id,
                        is_active: d.is_active,
                        type: d.type,
                        weight: d.weight,
                        source_id: d.source_id,
                        target_id: d.target_id,
                        description: d.description,
                        time_created: d.time_created,
                        is_show: true,
                    };
                });

            // Render the nodes
            const node = zoomGroup
                .selectAll('.node')
                .data(graph.nodes)
                .enter()
                .filter((d) => d.is_active)
                .append('g')
                .attr('class', 'node')
                //.attr('transform', (d) => `translate(${d.coord_x}, ${d.coord_y})`)
                .call(drag(simulation)); // Enable node drag using the 'drag' function
        
            const node_circle = node
                .append('circle')
                .attr('r', NODE_RADIUS)
                .attr('fill', '#ccc')
                .attr('stroke', '#fff')
                .attr('stroke-width', 1.5)
                .on("click", (event, d) => {
                    this.node_edit = {
                        id: d.id,
                        is_active: d.is_active,
                        type: d.type,
                        weight: d.weight,
                        name: d.name,
                        coord_x: d.fx,
                        coord_y: d.fy,
                        coord_z: d.coord_z,
                        description: d.description,
                        time_created: d.time_created,
                        is_show: true,
                    }
                });
        
            const node_text = node
                .append('text')
                .attr('dx', 7)
                //.attr('dy', '.35em')
                .attr('alignment-baseline', 'middle')
                .style('pointer-events', 'none')
                .text((d) => `${d.name} [${d.id}]`);
        
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

                    // way to directly set source / target node coordinates for link
                    // .attr('x1', (d) => graph.nodes[this.nodes_index_map[d.source_id]].x)
                    // .attr('y1', (d) => graph.nodes[this.nodes_index_map[d.source_id]].y)
                    // .attr('x2', (d) => graph.nodes[this.nodes_index_map[d.target_id]].x)
                    // .attr('y2', (d) => graph.nodes[this.nodes_index_map[d.target_id]].y);
        
                node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

                // HACK: remove in future (update name from data after it changes)
                node_text.text((d) => `${d.name} [${d.id}]`);
            });
          
              // ----------------------------------------
              // Zoomed function to handle zooming and panning
            function zoomed(e) {
                zoomGroup.attr("transform", e.transform);
            }
        },
        update_node(node) {
            //console.log(node.is_active);
            let n = this.graph.nodes[this.nodes_index_map[node.id]];
            n.is_active = node.is_active;
            n.type = node.type;
            n.weight = node.weight;
            n.name = node.name;
            n.coord_x = parseInt(node.coord_x);
            n.fx = parseInt(node.coord_x);
            n.coord_y = parseInt(node.coord_y);
            n.fy = parseInt(node.coord_y);
            n.coord_z = parseInt(node.coord_z);
            n.description = node.description;
        },
        update_link(link) {
            //console.log(link.id);
            let l = this.graph.links[this.links_index_map[link.id]];
            l.is_active = link.is_active;
            l.type = link.type;
            l.weight = link.weight;
            l.source_id = link.source_id;
            l.source = this.graph.nodes[this.nodes_index_map[link.source_id]];
            l.target_id = link.target_id;
            l.target = this.graph.nodes[this.nodes_index_map[link.target_id]];
            l.description = link.description;
        },
        add_node(node) {
            //var replaced_node = this.graph.nodes[this.nodes_index_map[node.id]];
            var replaced_node = {
                id: this.uuidv4(), // HACK: generate guid for store faked id
                name: node.name,
                is_active: node.is_active,
                type: node.type,
                weight: node.weight,
                coord_x: parseInt(node.coord_x),
                coord_y: parseInt(node.coord_y),
                coord_z: parseInt(node.coord_z),
                description: node.description,
            };

            this.graph.nodes.push(replaced_node);
            this.arise_info_popup('add node');
        },
        add_link(link) {
            var replaced_link = {
                id: this.uuidv4(), // HACK: generate guid for store faked id
                is_active: link.is_active,
                type: link.type,
                weight: link.weight,
                source_id: parseInt(link.source_id),
                target_id: parseInt(link.target_id),
                description: link.description,
            };

            this.graph.links.push(replaced_link);
            this.arise_info_popup('add link');
        },
        async save() {
            // TODO: finish

            this.arise_info_popup('Grapgh saved');
        },
        arise_error_popup(message) {
            this.error_popup_on = true;
            this.error_message = message;
        },
        close_error_popup() {
            this.error_popup_on = !this.error_popup_on;
            this.error_message = "";
        },
        arise_info_popup(message) {
            this.info_popup_on = true;
            this.info_message = message;
        },
        close_info_popup() {
            this.info_popup_on = !this.info_popup_on;
            this.info_message = "";
        },
        uuidv4() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }          
    }
}).mount('#app')