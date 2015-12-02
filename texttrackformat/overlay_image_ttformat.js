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
          imagecontent: '<img src="http://rack.2.mshcdn.com/media/ZgkyMDE0LzA5LzEwLzY4L2lwaG9uZXBsdXMuZDdjZGIuanBnCnAJdGh1bWIJOTUweDUzNCMKZQlqcGc/f43081be/d6c/iphone-plus.jpg" height="50%" width="50%"></img>',
         //webcontent: '<img src="http://rack.2.mshcdn.com/media/ZgkyMDE0LzA5LzEwLzY4L2lwaG9uZXBsdXMuZDdjZGIuanBnCnAJdGh1bWIJOTUweDUzNCMKZQlqcGc/f43081be/d6c/iphone-plus.jpg" height="50%" width="50%"></img>',
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

      //showOverlay,
      //hideOverlay,
      init;

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
        
        player.catalog.getvideo(player.options()['data-video-id'], function(error, video){
        console.log(video);
        player.catalog.load(video);
        player.on("loadedmatedata",function()
        {
          var trackIndex = player.textTracks().length-1;
          console.log(trackIndex);
        });
           });
    }
  };
  // register the plugin
  videojs.plugin('overlay', init);
})(window, window.videojs);
