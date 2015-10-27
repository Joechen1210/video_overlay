/*! videojs-overlay - v0.0.0 - 2014-4-26
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs) {
  'use strict';


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
    el.style.borderStyle = 'none';
    //el.style.opacity = 0.2;

    // if an alignment was specified, add the appropriate class
   //if (align) {
      el.className += ' vjs-overlay-' + align;
    //}

    // append the content
    if (typeof content === 'string') 
    {
      el.innerHTML = content;
    }
    else
    {
      el.appendChild(content);
    }
        // add the overlay to the player
    player.el().appendChild(el);
      
      //add parent div
      var parentdiv = document.createElement('div');
          parentdiv.className = 'vjs-overlay';
          parentdiv.className += ' div-parent';
          parentdiv.id = 'divparent';
      
      var rowdiv1 = document.createElement('div');
          rowdiv1.className = 'vjs-overlay';
          rowdiv1.className += ' row';
          rowdiv1.id = 'row1div';
          
      var rowdiv2 = document.createElement('div');
          rowdiv2.className = 'vjs-overlay';
          rowdiv2.className += ' row';
          rowdiv2.id = 'row2div';
          
      var celldiv1 = document.createElement('div');
          celldiv1.className = 'vjs-overlay';
          celldiv1.className += ' cell';
          celldiv1.id = 'row1div';
          
      var celldiv2 = document.createElement('div');
          cellldiv2.className = 'vjs-overlay';
          celldiv2.className += ' cell';
          celldiv2.id = 'row2div';
      
      //add web site div
       var el2 = document.createElement('div');
          el2.className = 'vjs-overlay';
          el2.className += ' vjs-overlay-center';
          el2.id = 'overlay2';
          
      //add iframe witch use to embed URL 
    var el2frame = document.createElement('iframe');
       el2frame.src = 'http://htmlpreview.github.io/?https://raw.githubusercontent.com/Joechen1210/video_overlay/master/index.html';
       el2.appendChild(el2frame);
       //rowdiv2.appendChild(el2);
      //add close web button
      var closediv = document.createElement('div');
          closediv.className = 'vjs-overlay';
          closediv.className += ' closediv';
          closediv.id = 'divclose';
      var closebtn = document.createElement('button');
      var closetext = document.createTextNode('X');
      closebtn.appendChild(closetext);
      closediv.appendChild(closebtn);
      //rowdv1.appendChild(closediv);


      //parentdiv.appendChild(closediv);
      //parentdiv.appendChild(el2);
        parentdiv.appendChild(rowdiv1);
        parentdiv.appendChild(rowdiv2);
        
      var ishidden = false;
     el.onclick = function()
     {
       if(ishidden) 
       {
           player.el().removeChild(parentdiv);
           ishidden = false;
           //player.el().removeChild(el2);
           player.play();
       }
       else
       {
           player.el().appendChild(parentdiv);
           //player.el().appendChild(el2);
           ishidden = true;
           player.pause();
       }
     }
     
         closebtn.onclick = function()
      {
           player.el().removeChild(parentdiv);
           //player.el().removeChild(el2);
           ishidden = false;
           player.play();
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
