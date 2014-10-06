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

window.io || (io = {});

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

    for (var i = 0, l = PRE_LOAD_CALLS.length; i < l; ++i) {
      STS.app.api.apply(PRE_LOAD_CALLS[i][0], PRE_LOAD_CALLS[i][1]);
    }

    PRE_LOAD_CALLS = [];
  }
  /*
  if (STS.options.ENABLE_REALTIME) {
    var opts = undefined;
    if (STS.options.API_SOCKET_BASEURL) {
      opts = { resource : STS.options.API_SOCKET_BASEURL };
    }
    io = io.connect(STS.options.API_BASE_URL, opts);

    io.on('connect', function() {
      __CONNECTED__ = true;
      runBufferedRequests();
    });

    io.on('disconnect', function() {
      __CONNECTED__ = false;
    });

    //----------------------------------------------------------------------------

    io.on('stats:update', function(stats) {
      STS.events.onStatsUpdate(stats);
    });

    io.on('shares:update', function(shares) {
      STS.events.onSharesLoad(shares);
    });

    io.on('tweets:updateCount', function(count) {
      $('.tweets-support-total').numberSpinner('set', count);
    });

    io.on('l:views', function(reps) {
      STS.events.onLegislatorStatsIncrement(reps, 'views');
      notifyLegislatorMap(reps, 'views');
    });

    io.on('l:calls', function(reps) {
      STS.events.onLegislatorStatsIncrement(reps, 'calls');
      notifyLegislatorMap(reps, 'calls');
    });

    io.on('l:emails', function(reps) {
      STS.events.onLegislatorStatsIncrement(reps, 'emails');
      notifyLegislatorMap(reps, 'emails');
    });

    io.on('l:tweets', function(reps) {
      STS.events.onLegislatorStatsIncrement(reps, 'tweets');
      notifyLegislatorMap(reps, 'tweets');
    });

    io.on('l:facebooks', function(reps) {
      STS.events.onLegislatorStatsIncrement(reps, 'facebooks');
      notifyLegislatorMap(reps, 'facebooks');
    });
  }
  */

  //----------------------------------------------------------------------------
  // reusable event handlers

  function notifyLegislatorMap(reps, event)
  {
    var colors = STS.CampaignMap.EVENT_COLORS;

    var color = colors[event],
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
      io.emit(ioEvent, data, onComplete);
    } else if (ajaxUrl) {
      var method = "GET";
      if (ajaxUrl.url) {
        method = ajaxUrl.method;
        ajaxUrl = ajaxUrl.url;
      }

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
