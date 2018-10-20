var appVue = new Vue({
    el: ".app-vue",
    data: {
        videos: [],
        searchResults: [],
        menuSelected: false,
        searchSelected: false,
        search: '',
        urlApi: 'https://www.googleapis.com/youtube/v3/',
        keyApi: 'AIzaSyDkAhIY2OrvmrYHQp_gxT8mywbx2Lqn_0g',
        idChannel: 'UCH2VZQBLFTOp6I_qgnBJCuQ', //Encontre outros cannais acessando esse link https://commentpicker.com/youtube-channel-id.php
        countResults: 12
    },

    created: function(){
        this.loadVideos();
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

        ISO8601toDuration: function(duration){
            duration = duration.replace('PT', '');
            duration = duration.split("S").join(":").split("M").join(":").split("H").join(":").split(":");
            duration = duration.slice(0, -1);

            if(duration.length == 1){
                duration.push("00");
                duration = duration[0] + ":" + duration[1];
            }

            else if(duration.length == 2){
                if(duration[1].length != 2){
                    duration[1] = "0" + duration[1];
                }
                duration = duration[0] + ":" + duration[1];
            }

            else if(duration.length == 3){
                if(duration[2].length != 2){
                    duration[2] = "0" + duration[2];
                }
                duration = duration[0] + ":" + duration[1] + ":" + duration[2];
            }

            return duration;
        },

        formatViews: function(views){
            if(views >= 1000000000){
                return (views / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
            }
             
            if(views >= 1000000){
                return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }

            if(views >= 1000){
                return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            }
        },

        cutLongText: function(text, size){
            if(text.length > size){
                return text.substring(0, size) + '...';
            }
            else{
                return text;
            }
        },

        loadVideos: function(){
            var self = this;

            $.ajax({
                url: self.urlApi + "search?key=" + self.keyApi + "&channelId=" + self.idChannel + "&part=snippet,id&type=video&order=date&maxResults=" + self.countResults,
                success: function(result){
                    var idVideo = '';

                    self.videos = result;

                    $.each(self.videos.items, function(index, video){
                        idVideo = video.id.videoId;

                        $.ajax({
                            url: self.urlApi + "videos?key=" + self.keyApi + "&id=" + idVideo + "&part=contentDetails,statistics",
                            success: function(videoItem){
                                self.$set(self.videos.items[index], 'viewCount', self.formatViews(videoItem.items[0].statistics.viewCount));
                                self.$set(self.videos.items[index], 'duration', self.ISO8601toDuration(videoItem.items[0].contentDetails.duration));
                            }
                        });
                    });
                }
            });
        },
    },

    watch: {
    }
});