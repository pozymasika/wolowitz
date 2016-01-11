/*
*Wolowitz - A self titled HTML5 video player that i wrote for Apollo II.
*@author pozy<masikapolycarp@gmail.com
*/
(function (w) {
  var Utils = {
    listenEvent: function (evtName, evtTarget, evtFunction) {
      if(window.addEventListener) evtTarget.addEventListener(evtName, evtFunction, false);
      else if(window.attachEvent) evtTarget.attachEvent("on" + evtName, evtFunction);
      else evtTarget["on" + evtName] = evtFunction;
    },
    timeFormat: function (time) {
      var hours,min,sec,temp;
      min = time / 60;
      if(min <= 60){
          sec = min.toString().split('.')[1];
          sec = sec ? (sec / Math.pow(10,sec.toString().length)) * 60 : 0;
          //truncate min to a whole number
          min = min.toString().split('.')[0];
          sec = Math.round(sec);
          //
          hours = 0;
      } else {
          temp = (min / 60).toString().split('.');
          hours = temp[0];
          min = (temp[1] / Math.pow(10,temp[1].toString().length)) * 60;
          //
          temp = min.toString().split('.');
          min = temp[0];
          sec = Math.round((temp[1] / Math.pow(10,temp[1].toString().length)) * 60);
    }
    //
    return {
      hours: hours,
      minutes: min,
      seconds: sec
    }
  },
  testVideo: function() {
        var elem = document.createElement('video'),
            bool = false;
            try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');
                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }
        return bool;
    }
}
  function Wolowitz (opts) {
      var elements;
      if(!opts.hasOwnProperty("selector")) throw new Error("Please provide us with a selector to work with!");
      elements = document.querySelectorAll(opts.selector);
      for(var element = 0; element < elements.length; element++) {
          elements[element].Wolowitz();
      }
  }
  //
  Element.prototype.generateControls = function () {
    return '<div class="controls">' +
                '<span class="control icon-play" data-ww-command="play"></span>' +
                '<span class="length">00:00</span>' +
                '<span class="control ww-track" data-ww-command="progress"> <span class="track"></span> </span>' +
                '<span class="icon-vol"></span>' +
                '<span class="control icon-volume" data-ww-command="v_change"><span class="track"></span></span>' +
                '<span class="control icon-fullscreen" data-ww-command="fullscreen"></span>' +
           '</div>';
  }
  Element.prototype.fireControls = function () {
    var video = this.getElementsByClassName("ww-video")[0];
    var controls = this.getElementsByClassName("control");
    var events = {
      onDoubleTap: function (e) {
        if(video.paused || !video.currentTime) {
            video.play();
          } else {
            video.pause();
        }
        //
	       this.getElementsByClassName("icon-play")[0].classList.toggle("icon-pause");
      }.bind(this),
      goFullScreen: function (e) {
        (function requestFullScreen (e) {
            return  video.requestFullscreen && video.requestFullscreen() ||
                    video.mozRequestFullScreen && video.mozRequestFullScreen() ||
                    video.webkitRequestFullscreen && video.webkitRequestFullscreen();
        })(e);
      },
      onMarkerChange: function (e) {
       var time = e.offsetX / e.target.offsetWidth * video.duration;
       if(video.currentTime) video.pause();
       video.currentTime = time;
       video.play();
      },
     volumeChange: function (e) {
       var target = e.target.getAttribute("data-ww-command") ? e.target.getElementsByClassName("track")[0] : e.target;
       if(this.getElementsByClassName("icon-vol")[0].classList.contains("icon-mute")) {
         this.getElementsByClassName("icon-vol")[0].classList.remove("icon-mute");
       }
       video.volume = e.offsetX / e.target.offsetWidth;
       target.style.width = (video.volume * 100) + '%';
     }.bind(this),
     onTimeUpdate: function (e) {
       var elapsed = video.duration - video.currentTime;
       var time = Utils.timeFormat(elapsed);
       var time_format = [time.hours,time.minutes,time.seconds].join(':');
       //
       this.updateProgress.call(this, time_format);
       //
     }.bind(this),
     onSpeedChange: function (e) {
         video.playbackRate = e.target.value;
     },
     toggleMute: function (e) {
       e.target.classList.toggle("icon-mute");
       video.volume = 0;
       //return volume to initial state if already muted
       if(!e.target.classList.contains("icon-mute")) {
         video.volume = parseInt(getComputedStyle(this.getElementsByClassName("icon-volume")[0].children[0]).width) / 100;
       }
     }.bind(this)
   };
    //
    for(var control = 0; control < controls.length; ++control) {
      switch(controls[control].getAttribute("data-ww-command")) {
        case "play":
          Utils.listenEvent("click", controls[control], events.onDoubleTap);
        break;
        case "v_change":
          Utils.listenEvent("click", controls[control], events.volumeChange);
        break;
        case "fullscreen":
          Utils.listenEvent("click", controls[control], events.goFullScreen);
        break;
        case "progress":
          Utils.listenEvent("click", controls[control], events.onMarkerChange);
        break;
      }
    }
    //
    Utils.listenEvent("click", this.getElementsByClassName("icon-vol")[0], events.toggleMute);
    Utils.listenEvent("dblclick", video, events.onDoubleTap);
    Utils.listenEvent("timeupdate", video, events.onTimeUpdate);
    Utils.listenEvent("error", video, function (e) {
      this.insertPoster();
    }.bind(this));
  }
  Element.prototype.insertPoster = function () {
    //TODO - Replace this with canvas.
    var image = new Image();
    image.src = "wwitz.png";
    image.classList.add("ww-error");
    this.removeChild(document.querySelector("video"));
    this.appendChild(image);
  }
  Element.prototype.notify = function (message) {
      //TODO!
  }
  Element.prototype.updateProgress = function (time_format) {
    var lengthEl = this.getElementsByClassName("length")[0];
    var progress = this.getElementsByClassName("ww-track")[0];
    var videoEl = this.getElementsByClassName('ww-video')[0];
    var percentage = Math.round((videoEl.currentTime / videoEl.duration) * 100);
    //
    lengthEl.innerHTML = time_format;
    progress.getElementsByClassName("track")[0].style.width = percentage + '%';
  }
  Element.prototype.Wolowitz = function () {
    var videoSource = this.getAttribute("src");
    var video = this;
    if(this.nodeName !== "VIDEO") {
      video = document.createElement("video");
      video.src = videoSource;
      this.innerHTML = "";
      this.appendChild(video);
    }
    //test for video support
    if(! (Utils.testVideo().ogg || Utils.testVideo().h264 || Utils.testVideo().webm) ) {
      this.insertPoster();
      return;
    }

    //buffering
      setInterval(function () {
          var bufferedEnd = video.buffered.end(video.buffered.length - 1);
          //this.getElementsByClassName("track")[0].style.width = ((bufferedEnd / video.duration) * 100) + "%";
      }.bind(this),300);

    video.classList.add("ww-video");
    this.innerHTML = this.innerHTML + this.generateControls();
    this.fireControls();
  }
  //
  w.Wolowitz = Wolowitz;
})(typeof exports !== "undefined" ? exports : typeof window !== "undefined" ? window : this);
