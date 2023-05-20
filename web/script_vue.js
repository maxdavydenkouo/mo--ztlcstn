const { createApp } = Vue

createApp({
    data() {
        return {
            nodes: [],
            links: [],
            is_payload_exists: false,
            error_message: "",
            error_popup_on: false,
            DUMMY_DATA: [
                {id: 1, value: 10, name: 'some'},
                {id: 2, value: 13, name: 'mose'},
                {id: 3, value: 31, name: 'abricos'},
                {id: 4, value: 37, name: 'roga'},
                {id: 5, value: 50, name: 'curaga'}
            ]
        }
    },
    created() {
        // Vue instance is created
        //let q = new URLSearchParams(window.location.search.substring(1)).get("q");
        this.nodes = this.get_items('nodes');
        this.links = this.get_items('links');
    },
    mounted() {
        // DOM has been mounted
        build_plot(this.DUMMY_DATA);
    },
    methods: {
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