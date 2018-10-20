var appVue = new Vue({
    el: ".app-vue",
    data: {
        videos: [],
        video: [],
        searchResults: [],
        menuSelected: false,
        searchSelected: false,
        loader: false,
        modal: false,
        search: '',
        nextPage: '',
        urlApi: 'https://www.googleapis.com/youtube/v3/',
        keyApi: 'AIzaSyDkAhIY2OrvmrYHQp_gxT8mywbx2Lqn_0g',
        idChannel: 'UCH2VZQBLFTOp6I_qgnBJCuQ', //Encontre outros cannais acessando esse link https://commentpicker.com/youtube-channel-id.php
    },

    created: function(){
        this.loadVideos();

        this.search = (this.getUrlParameter('search')) ? this.getUrlParameter('search') : '';
        this.searchSelected =  (this.getUrlParameter('search') != '') ? true : false;     
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

        formatViewsInternal: function(views){
            return views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },

        formatDate: function(date){
            meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            
            date = new Date(date);
            day  = date.getDate().toString();
            dayFinal = (day.length == 1) ? '0' + day : day;
            month = date.getMonth();
            year = date.getFullYear();

            return dayFinal + " de " + meses[month] + " de " + year;
        },

        getUrlParameter: function(sParam){
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'), sParameterName, i;

            for(i = 0; i < sURLVariables.length; i++){
                sParameterName = sURLVariables[i].split('=');

                if(sParameterName[0] === sParam){
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                } else{
                    return false;
                }
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
            var urlAjax = '';

            if(this.search){
                urlAjax = this.urlApi + "search?key=" + this.keyApi + "&channelId=" + this.idChannel + "&part=snippet,id&type=video&order=date&q=" + this.search;
            } else{
                urlAjax = this.urlApi + "search?key=" + this.keyApi + "&channelId=" + this.idChannel + "&part=snippet,id&type=video&order=date&maxResults=12";
            }

            $.ajax({
                url: urlAjax,
                success: function(result){
                    var idVideo = '';

                    self.videos = result;
                    self.nextPage = self.videos.nextPageToken;

                    $.each(self.videos.items, function(index, video){
                        idVideo = video.id.videoId;

                        $.ajax({
                            url: self.urlApi + "videos?key=" + self.keyApi + "&id=" + idVideo + "&part=contentDetails,statistics",
                            success: function(videoItem){
                                self.$set(self.videos.items[index], 'viewCount', videoItem.items[0].statistics.viewCount);
                                self.$set(self.videos.items[index], 'duration', self.ISO8601toDuration(videoItem.items[0].contentDetails.duration));
                            }
                        });
                    });
                }
            });
        },

        loadMoreVideos: function(nextPage){
            var self = this;

            $.ajax({
                url: self.urlApi + "search?key=" + self.keyApi + "&channelId=" + self.idChannel + "&part=snippet,id&type=video&order=date&pageToken=" + nextPage + "&maxResults=12",
                beforeSend: function(){
                    self.loader = true;
                },

                success: function(result){
                    var idVideo = '';

                    self.nextPage = result.nextPageToken;

                    $.each(result.items, function(index, newItem){
                        self.videos.items.push(newItem);
                    });

                    $.each(self.videos.items, function(index, video){
                        idVideo = video.id.videoId;

                        $.ajax({
                            url: self.urlApi + "videos?key=" + self.keyApi + "&id=" + idVideo + "&part=contentDetails,statistics",
                            success: function(videoItem){
                                self.$set(self.videos.items[index], 'viewCount', videoItem.items[0].statistics.viewCount);
                                self.$set(self.videos.items[index], 'duration', self.ISO8601toDuration(videoItem.items[0].contentDetails.duration));
                            }
                        });
                    });
                },

                complete: function(){
                    self.loader = false;
                }
            });
        },

        singleVideo: function(videoId, statusModal){
            var self = this;

            this.modal = statusModal;

            $.ajax({
                url: self.urlApi + "videos?key=" + self.keyApi + "&id=" + videoId + "&part=id,snippet,contentDetails,statistics",
                success: function(resultVideo){
                    self.video = resultVideo.items[0];
                }
            });
        },
    },

    watch:{
        search: function(){
            this.loadVideos();
        },

        videos: function(){
            console.log(this.videos);
            this.singleVideo(this.videos.items[0].id.videoId, false);
        },
    }
});