const { createApp } = Vue

createApp({
    data() {
    return {
        nodes: [],
        links: [],
        is_payload_exists: false,
        error_message: "",
        error_message_on: false
    }
    },
    created() {
    //let q = new URLSearchParams(window.location.search.substring(1)).get("q");
    this.get_nodes();
    this.get_links();
    },
    methods: {
    async get_nodes() {
        return this.get_items('nodes');
    },
    async get_links() {
        return this.get_items('links');
    },
    async get_items(item) {
        // get items by axios request
        let res = await axios.get('api/' + item);
        if (res.data.success == true) {
        let payload = res.data.payload;

        // map
        if (item == 'nodes') {
            this.nodes = payload;
        } else if (item == 'links') {
            this.links = payload;
        }
        } else {
        // errors
        this.error_message = res.data.description;
        this.error_message_on = true;
        }
    },
    async save_as_relevant() {
        if (this.is_payload_exists == true && this.response.name != "") {
        let res = await axios.post('predict/saved?q=' + encodeURIComponent(this.response.name));
        if (res.data.meta.success == false) {
            this.arise_error(res.data.meta.description);  
        } else {
            this.response.is_saved = true;
            this.response.saved_id = res.data.payload.id;
        }
        } else {
        this.arise_error("can't save item by empty name value");
        }
    },
    arise_error(message) {
        this.error_message = message;
        this.error_message_on = true;
    },
    close_error_message() {
        this.error_message = "";
        this.error_message_on = !this.is_error_message_exists;
    }
    }
}).mount('#app')