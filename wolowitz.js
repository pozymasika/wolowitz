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
    return '<div id="controls" data-ww-controls="true">' +
              '<div  class="pr">' +
                '<div class="progress">' +
                  '<span class="track"></span>' +
                '</div>' +
              '</div>' +
              '<ul data-ww-controls="true">' +
              '<li class="play-button control" title="Play/Pause" data-ww-command="play"></li>' +
              '<li class="length">00:00</li>' +
              '<li><input type="range" id="progress" class="ww-track control" value="0" data-ww-command="progress"></li>' +
              '<li class="volume_up vol control" data-ww-command="v_up"></li>' +
              '<li class="volume_down vol control" data-ww-command="v_down"></li>' +
              '<li class="fullscreen-button control" data-ww-command="fullscreen"></li>' +
              '<li class="elapsed">00:00</li>' +
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
	       this.getElementsByClassName("play-button")[0].classList.toggle("pause-button");
      }.bind(this),
      goFullScreen: function (e) {
        (function requestFullScreen (e) {
            return  video.requestFullscreen && video.requestFullscreen() ||
                    video.mozRequestFullScreen && video.mozRequestFullScreen() ||
                    video.webkitRequestFullscreen && video.webkitRequestFullscreen();
        })(e);
      },
      onMarkerChange: function (e) {
        var percentage = e.target.value,
           temp_time;
       //
       temp_time = (percentage * video.duration) / 100;
       if(video.currentTime) video.pause();
       video.currentTime = temp_time;
       video.play();
      },
      onVolumeUp: function (e) {
        if(video.volume === 1) return;
            video.volume += 0.1;
      },
      onVolumeDown: function (e) {
       if(video.volume <= 1 && video.volume > 0.1 ) video.volume -= 0.1;
     },
     onTimeUpdate: function (e) {
       var elapsed = video.duration - video.currentTime;
       var used_time = video.currentTime;
       // the crazy timeFormat function loss about 1300 milli-seconds
       //so recover that here -> 1.3
       //no one will notice that
       var used_format = Utils.timeFormat(used_time + 1.3);
       var time = Utils.timeFormat(elapsed);
       var time_format = [time.hours,time.minutes,time.seconds].join(':');
       //
       this.updateProgress.call(this, used_format, time_format);
       //
     }.bind(this),
     onSpeedChange: function (e) {
         video.playbackRate = e.target.value;
     }
    };
    //
    for(var control = 0; control < controls.length; ++control) {
      switch(controls[control].getAttribute("data-ww-command")) {
        case "play":
          Utils.listenEvent("click", controls[control], events.onDoubleTap);
        break;
        case "v_up":
          Utils.listenEvent("click", controls[control], events.onVolumeUp);
        break;
        case "v_down":
          Utils.listenEvent("click", controls[control], events.onVolumeDown);
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
  Element.prototype.updateProgress = function (used_format, time_format) {
    var lengthEl = this.getElementsByClassName("length")[0];
    var elapsedEl = this.getElementsByClassName("elapsed")[0];
    var progress = this.getElementsByClassName("ww-track")[0];
    var videoEl = this.getElementsByClassName('ww-video')[0];
    var percentage = Math.round((videoEl.currentTime / videoEl.duration) * 100);
    //
    lengthEl.innerHTML = time_format;
    elapsedEl.innerHTML = '-' + [used_format.hours,used_format.minutes,used_format.seconds].join(':');
    progress.value = percentage;

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
          this.getElementsByClassName("track")[0].style.width = ((bufferedEnd / video.duration) * 100) + "%";
      }.bind(this),300);

    video.classList.add("ww-video");
    this.innerHTML = this.innerHTML + this.generateControls();
    this.fireControls();
  }
  //
  w.Wolowitz = Wolowitz;
})(typeof exports !== "undefined" ? exports : typeof window !== "undefined" ? window : this);
