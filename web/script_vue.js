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
            build_plot(this.graph);

            // TEMP: fill dummy data
            this.node_edit = this.graph.nodes[12];
            this.node_edit.is_show = true;
            this.link_edit = this.graph.links[23];
            this.link_edit.is_show = true;
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