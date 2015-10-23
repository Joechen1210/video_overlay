/*! videojs-overlay - v0.0.0 - 2014-4-26
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs) {
  'use strict';

//function loadjscssfile(filename, filetype){
    //if (filetype=="js"){ //if filename is a external JavaScript file
        //var fileref=document.createElement('script')
        //fileref.setAttribute("type","text/javascript")
        //fileref.setAttribute("src", filename)
        //player.el().appendChild(fileref);
    //}
    //else if (filetype=="css"){ //if filename is an external CSS file
    //    var fileref=document.createElement("link")
    //    fileref.setAttribute("rel", "stylesheet")
    //    fileref.setAttribute("type", "text/css")
    //    fileref.setAttribute("href", filename)
    //}
    //if (typeof fileref!="undefined")
    //    document.getElementsByTagName("head")[0].appendChild(fileref)
//}
//loadjscssfile("http://code.jquery.com/jquery-1.10.2.js", "js");
//loadjscssfile("http://code.jquery.com/ui/1.11.4/jquery-ui.js", "js");
//loadjscssfile("http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css", "css");

  var defaults = {
        content: 'This overlay will show up while the video is playing',
        overlays: [{
          start: 'playing',
          end: 'paused',
          contentUrl: 'http://www.mobile01.com/topicdetail.php?f=300&t=1120999',
        }]
      },
      // comparator function to sort overlays by start time
      ascendingByStart = function(left, right) {
        return left.start - right.start;
      },
      // comparator function to sort overlays by end time
      ascendingByEnd = function(left, right) {
        return left.end - right.end;
      },

      showOverlay,
      hideOverlay,
      init;

  showOverlay = function(player, settings, overlay) {
    // create the overlay wrapper
    var el = document.createElement('div'),
        content = overlay.content || settings.content,
        align = settings.align || overlay.align;
    el.className = 'vjs-overlay';
    overlay.el = el;

    // if an alignment was specified, add the appropriate class
   //if (align) {
      el.className += ' vjs-overlay-' + align;
    //}

    // append the content
    //if (typeof content === 'string') {
      el.innerHTML = content;
    //} else {
    //  el.appendChild(content);
      
       var el2 = document.createElement('div');
          el2.className = 'vjs-overlay';
          el2.id = 'overlay2';
      // overlay.el += el2;
         el2.className += ' vjs-overlay-center';
         el2.innerHTML = '<iframe src="ttps://raw.githubusercontent.com/Joechen1210/video_overlay/master/index.html"></iframe>';
        // el2..dialog();
      
    // add the overlay to the player
    player.el().appendChild(el);
      
      var ishidden = false;
    //}
     el.onclick = function()
     {
       if(ishidden) 
       {
         ishidden = false;
         player.el().removeChild(el2);
         player.play();
       }
       else
       {
         player.el().appendChild(el2);
         ishidden = true;
         player.pause();
       }
        //alert("hello")                     //window.open("http://www.w3schools.com/tags/tag_div.asp");
        //var ad = document.createElement('div');
        //ad.className = 'vjs-overlay-center';
        //overlay.el = ad;
        //ad.innerHTML= overlay.contentUrl;
         //var fram = document.createElement('iframe'),
        //     context = overlay.contentUrl;
         //fra
        // ad.innerHTML = content;
         //player.el().appendChild(ad);
      }
       　
    
    
  };
  hideOverlay = function(player, settings, overlay) {
    overlay.el.parentNode.removeChild(overlay.el);
    delete overlay.el;
  };

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  init = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options),
        player = this,
        events = {},
        startTimes = [],
        endTimes = [],

        // an event handler that displays all overlays of that type
        showOverlayListener = function(event) {
          var overlays = events[event.type],
              i = overlays.length,
              overlay;
          while (i--) {
            overlay = overlays[i];
            if (overlay.el) {
              // overlay is already showing, do nothing
              continue;
            }
            showOverlay(player, settings, overlay);
          }
        },
        // an event handler that removes all overlays of that type
        hideOverlayListener = function(event) {
          var overlays = events[event.type],
              i = overlays.length,
              overlay;
          while (i--) {
            overlay = overlays[i];
            if (!overlay.el) {
              // overlay is already showing, do nothing
              continue;
            }
              
            // remove the overlay
           hideOverlay(player, settings, overlay);
          }
        },
        // returns a listener function that executes a callback when
        // the specified property of one of the overlays is less than
        // the current playback time
        addTimeupdateListener = function(overlays, prop, callback) {
          var lastTime = 0,
              earliest = 0,
              listener;

          listener = function() {
            var overlay = overlays[earliest],
                time = player.currentTime();

            // check if we've seeked backwards and rewind the earliest
            // showing overlay as a result
            if (lastTime > time) {
              earliest = 0;
              overlay = overlays[earliest];
            }

            for (; overlay && overlay[prop] <= time;
                 overlay = overlays[++earliest]) {
              callback(player, settings, overlay);
            }
            lastTime = time;
          };
          player.on('timeupdate', listener);
          player.overlay.eventListeners.push({
            type: 'timeupdate',
            fn: listener
          });
        },
        overlay,
        i;

    // cleanup listeners from previous invocations if necessary
    (function() {
      var listener, i;
      for (i in player.overlay.eventListeners) {
        listener = player.overlay.eventListeners[i];
        player.off(listener.type, listener.fn);
      }
    })();

    player.overlay.eventListeners = [];

    for (i in settings.overlays) {
      overlay = settings.overlays[i];

      // showing overlays
      if (typeof overlay.start === 'string') {
        // start on an event

        if (!events[overlay.start]) {
          events[overlay.start] = [];
          player.on(overlay.start, showOverlayListener);
          player.overlay.eventListeners.push({
            type: overlay.start,
            fn: showOverlayListener
          });
        }
        events[overlay.start].push(overlay);
      } else {
        // start at a time
        startTimes.push(overlay);
      }

      // hiding overlays
      if (typeof overlay.end === 'string') {
        // end on an event
        if (!events[overlay.end]) {
          events[overlay.end] = [];
          player.on(overlay.end, hideOverlayListener);
          player.overlay.eventListeners.push({
            type: overlay.end,
            fn: hideOverlayListener
          });
        }
        events[overlay.end].push(overlay);
      } else {
        // end at a time
        endTimes.push(overlay);
      }
    }

    // setup time-based overlay starts
    if (startTimes.length) {
      startTimes.sort(ascendingByStart);
      addTimeupdateListener(startTimes, 'start', showOverlay);
    }

    // setup time-based overlay ends
    if (endTimes.length) {
      endTimes.sort(ascendingByEnd);
      addTimeupdateListener(endTimes, 'end', function(player, settings, overlay) {
        if (overlay.el) {
          hideOverlay(player, settings, overlay);
        }
      });
    }
  };

  // register the plugin
  videojs.plugin('overlay', init);
})(window, window.videojs);
