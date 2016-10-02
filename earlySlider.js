window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 25);
        };
})();

var $eSlider = (function(){
    var that = {
        settings:{
            moviesAPIkey : "api_key=3f34d35ba425dc8518bb9174cf1f6b56",
            moviesAPI : "https://api.themoviedb.org/3/movie/upcoming?",
            movies : [],
            slider: null,
            sliderCursor: 0
        }
    }

    that.init = function(id = "firstSlider"){
        var that = this,
            s = that.settings;
            s.slider = id

        that.slider();
        that.movies();
    }

    that.slider = function(){
        var that = this,
            s = that.settings;

        s.sliderEl = document.getElementById(s.slider);
        var clickLeft = document.querySelector("#"+s.slider+" .clickLeft");
            clickLeft.onclick = that.sliderClickLeft;
        var clickRight = document.querySelector("#"+s.slider+" .clickRight");
            clickRight.onclick = that.sliderClickRight;
        return s.sliderEl;
    }

    that.sliderMove = function(active,dest){
        var that = this,
            s = that.settings;

        var activeEl = document.querySelector("#"+s.slider+" > #item"+active);
        var destEl = document.querySelector("#"+s.slider+" > #item"+dest);

        function animateSlideToLeft(el){

              var lastPosition = 100;
              el.style.top="0%";

            (function loop() {
                if(lastPosition > 0){
                   var newPosition = lastPosition-1;
                   el.style.left=newPosition+"%";
                   lastPosition = newPosition;
                   requestAnimFrame(loop);
               }else{
                   return true;
               }
            })();
        }

        function animateSlideToHide(el){

              var lastPosition = 0;

            (function loop() {
                if(lastPosition < 100){
                   var newPosition = lastPosition+1;
                   el.style.left="-"+newPosition+"%";
                   lastPosition = newPosition;
                   requestAnimFrame(loop);
               }else{
                   el.style.top="100%";
                   return true;
               }
            })();
        }

        if( active < dest ){ // && destEl.classList.contains("hide")
            animateSlideToHide(activeEl);
            animateSlideToLeft(destEl);
            //destEl.style.left= "100%";
            //destEl.classList.remove("hide");
            //destEl.classList.add("hideToRight")
        }else{
            animateSlideToHide(activeEl);
            destEl.style.top="100%";
            destEl.style.left="100%";
            destEl.style.top="0%";
            animateSlideToLeft(destEl);
        }
        activeEl.classList.remove("active");
        destEl.classList.add("active");
        //destEl.classList.remove("hideToRight")


        console.warn("active:"+active+"#dest:"+dest);

        return true;
    }

    that.sliderCursorIncr = function(){
        var that = this,
            s = that.settings;

            var tmp = s.sliderCursor;

        s.sliderCursor++;
        if(s.sliderCursor > s.movies.length-1){
            s.sliderCursor = 0;
        }

        return that.sliderMove(tmp,s.sliderCursor);
    }

    that.sliderCursorDecr = function(){
        var that = this,
            s = that.settings;

            var tmp = s.sliderCursor;

        s.sliderCursor--;
        if(s.sliderCursor < 0){
            s.sliderCursor = s.movies.length-1;
        }

        console.warn(tmp+"#"+s.sliderCursor)

        return that.sliderMove(tmp,s.sliderCursor);
    }

    that.sliderClickLeft = function(){
        that.sliderCursorDecr();
        return false;
    }

    that.sliderClickRight = function(){
        that.sliderCursorIncr();
        return false;
    }

    that.movies = function(){
        var s = that.settings;
        var movies = {};

        movies.createEl = function(movie){
            var el = document.createElement("div");
            el.setAttribute("id","item"+movie.id);
            el.classList.add("item");
            if(movie.id == 0){
                el.classList.add("active");
            }

            var content = document.createElement("div");
            content.classList.add("av-body");
            content.style.left = movie.id * 100;
            var contentH = document.createElement("h2");
            contentH.textContent = movie.title;
            var vote = document.createElement("small");
            vote.textContent = movie.vote_average;
            vote.classList.add("vote");
            var voteTotal = document.createElement("span");
            voteTotal.textContent = "/5";
            vote.appendChild(voteTotal);
            contentH.appendChild(vote);
            content.appendChild(contentH);
            var contentP = document.createElement("p");
            contentP.textContent = movie.overview;
            content.appendChild(contentP);

            var figure = document.createElement("figure");
            var cover = document.createElement("img");
            cover.src=movie.cover;
            figure.appendChild(cover);


            //el.textContent = "test"+movie.id;
            el.appendChild(figure);
            el.appendChild(content);
            s.sliderEl.appendChild(el);

        }

        movies.get = function(url = s.moviesAPI+s.moviesAPIkey){

            function processData(data) {
                //console.warn(data);
                for(i = 0; i < data.results.length; i++){
                    var theMovieData = {
                        id: i,
                        title: data.results[i].original_title,
                        overview: data.results[i].overview,
                        cover: "https://image.tmdb.org/t/p/w600/"+data.results[i].backdrop_path,
                        vote_average:data.results[i].vote_average
                     };
                     movies.createEl(theMovieData);
                    s.movies.push(theMovieData);
                }
                //console.warn(s.movies);
                return true;
            }

            function handler() {
              if(this.readyState == this.DONE) {
                if(this.status == 200 &&
                   this.response != null) {
                  // success!
                  processData(JSON.parse(this.response));
                  return true;
                }
                // something went wrong
                alert("error");
                return false;
              }
            }

            var client = new XMLHttpRequest();
            client.onreadystatechange = handler;
            client.open("GET", url);
            client.send();

        }

        movies.get();
        return movies;
    }

    return that;
})();
