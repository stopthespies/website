/**
 * socket.io application object & request wrapper
 *
 * The first few requests when hitting the site will be pre-cached, as the socket won't
 * have had time to connect yet. Socket.io already does this, but we want to fallback to
 * AJAX instead of waiting however long for a socket to become available. If there's no
 * response from the socket server in a given time then AJAX will be run to load the initial
 * page content instead.
 *
 * This kind of mechanism should respond better under high load (if/when open socket connections
 * limits start to become a problem). It also allows us to easily disable the socket server
 * if we're experiencing any unforseen load issues.
 *
 * @package  StopTheSpies Website
 * @author   Sam Pospischil <pospi@spadgos.com>
 * @since    2014-08-24
 */
(function($, io) {

  var __CONNECTED__ = false,
      __LOADING__ = setTimeout(runBufferedRequests, STS.options.SOCKET_CONNECT_TIMEOUT),
      PRE_LOAD_CALLS = [],
      START = new Date();

  function runBufferedRequests()
  {
    clearTimeout(__LOADING__);
    __LOADING__ = false;
    if (!PRE_LOAD_CALLS.length) {
      return;
    }

    if (!__CONNECTED__) {
      console.log('Took too long to connect, use AJAX');
    }
    console.log('Running ' + PRE_LOAD_CALLS.length + ' precached requests...');

    for (var i = 0, l = PRE_LOAD_CALLS.length; i < l; ++i) {
      STS.app.api.apply(PRE_LOAD_CALLS[i][0], PRE_LOAD_CALLS[i][1]);
    }

    PRE_LOAD_CALLS = [];
  }

  if (STS.options.ENABLE_REALTIME) {
    io = io.connect(STS.options.API_BASE_URL);
  }

  io.on('connect', function() {
    console.log('Socket connection established, took ' + (new Date() - START) + 'ms.');
    __CONNECTED__ = true;
    runBufferedRequests();
  });

  io.on('disconnect', function() {
    console.error('Socket connection terminated!');
    __CONNECTED__ = false;
  });

  //----------------------------------------------------------------------------

  io.on('stats:update', function(stats) {
    console.log('Global stats updated');
    STS.events.onStatsLoad(stats);
  });

  io.on('l:views', function(reps) {
    console.log('Legislators viewed', reps);
    STS.events.onLegislatorStatsIncrement(reps, 'views');
    notifyLegislatorMap(reps, 'views');
  });

  io.on('l:calls', function(reps) {
    console.log('Legislators called', reps);
    STS.events.onLegislatorStatsIncrement(reps, 'calls');
    notifyLegislatorMap(reps, 'calls');
  });

  io.on('l:emails', function(reps) {
    console.log('Legislators emailed', reps);
    STS.events.onLegislatorStatsIncrement(reps, 'emails');
    notifyLegislatorMap(reps, 'emails');
  });

  io.on('l:tweets', function(reps) {
    console.log('Legislators tweeted', reps);
    STS.events.onLegislatorStatsIncrement(reps, 'tweets');
    notifyLegislatorMap(reps, 'tweets');
  });

  io.on('l:facebooks', function(reps) {
    console.log('Legislators facebooked', reps);
    STS.events.onLegislatorStatsIncrement(reps, 'facebooks');
    notifyLegislatorMap(reps, 'facebooks');
  });

  //----------------------------------------------------------------------------
  // reusable event handlers

  function notifyLegislatorMap(reps, event)
  {
    // :TODO: colourize per event type?
    var color = '#f1592a',
        count, ward, rep;

    for (rep in reps) {
      if (!reps.hasOwnProperty(rep)) continue;

      for (var i = 0, l = STS.TOTAL_MAPS_COUNT; i < l; ++i) {
        ward = STS.CampaignMap.getWardForMember(i, rep);
        if (!ward) {
          continue;  // senators :TODO: show some other way
        }
        count = reps[rep];
        STS.anim.map.notifyElectorate(ward, color, count);
      }
    }
  }

window._testMapPing = notifyLegislatorMap;

  //----------------------------------------------------------------------------
  // EXPORTS

  STS.app = io;

  STS.app.api = function(ioEvent, ajaxUrl, data, onComplete, onError)
  {
    data || (data = {});

    if (!__CONNECTED__ && __LOADING__) {
      PRE_LOAD_CALLS.push([this, arguments]);
      return;
    }

    if (__CONNECTED__ && ioEvent) {
      console.log('Socket request for ' + ioEvent + '...');
      io.emit(ioEvent, data, onComplete);
    } else if (ajaxUrl) {
      var method = "GET";
      if (ajaxUrl.url) {
        method = ajaxUrl.method;
        ajaxUrl = ajaxUrl.url;
      }

      console.log(method + ' request for ' + ajaxUrl + '...');

      $.ajax(ajaxUrl, {
        method: method,
        data: data,
        success: onComplete || function() {},
        error: onError || function() {},
        cache : true      // :NOTE: we'll always cache AJAX requests, and never cache socket ones. If the socket server is having issues then stale info is probably better to avoid load.
      });
    }
  };

})(jQuery, io);
