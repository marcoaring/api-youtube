var appVue = new Vue({
    el: ".app-vue",
    data: {
        searchResults: [],
        menuSelected: false,
        searchSelected: false,
        search: '',
    },

    created: function(){
        //this.loadPosts();
    },

    methods:{
        openMenu: function(){
            if(this.menuSelected){
            	this.menuSelected = false;
            } else{
            	this.menuSelected = true;
                this.searchSelected = false;
            }
        },

        openSearch: function(){
            if(this.searchSelected){
                this.searchSelected = false;
            } else{
                this.searchSelected = true;
                this.menuSelected = false;
            }
        },
    },

    watch: {
    }
});