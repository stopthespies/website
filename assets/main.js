
// -- require vendor/bootstrap.min



// -- require vendor/leaflet














// -- require randoms







var legislators = {}; // Too lazy to pass this variable around to modals ATM - TODO

(function($, io) {

var
  LEGISLATORS_LOCATOR_URL = STS.options.LEGISLATORS_LOCATOR_URL,
  SOCIAL_STATS_URL    = STS.options.SOCIAL_STATS_URL,

  TWEETS_READ_URL     = STS.options.TWEETS_READ_URL,
  STATS_READ_URL      = STS.options.STATS_READ_URL,

  SEND_EMAIL_URL      = STS.options.SEND_EMAIL_URL,
  LOG_URL_BASE      = STS.options.LOG_URL_BASE,

  MAP_START_SHADING = 100;   // this many actions to occur before we begin weighted shading of the campaign stats map

// Start up scripts
$(function() {

  // ----------------- POP OVERS ----------------------------

  $('.metric').tooltipster();

  // ----------------- MODALS ----------------------------

  $('body').on('click', '.contact .call-action', function (e) {

    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var callModalTemplate = $('#call-modal-template').html();
    //$('#call-modal-container').html(_.template(callModalTemplate, legislator));
    //$('#call-modal-container .modal').modal();
    var takeoverContent = _.template(callModalTemplate, legislator);
    takeover(takeoverContent);

    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'calls', legislators: legislatorId}, function(d) {});

  });

  $('body').on('click', '.contact .email-action', function (e) {

    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var emailModalTemplate = $('#email-modal-template').html();
    //$('#email-modal-container').html(_.template(emailModalTemplate, legislator));
    //$('#email-modal-container .modal').modal();

    var takeoverContent = _.template(emailModalTemplate, legislator);
    takeover(takeoverContent);


    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'emails', legislators: legislatorId}, function(d) {});

  });

  $('body').on('click', '.contact .tweets-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'tweets', legislators: legislatorId}, function(d) {});

  });

  $('body').on('click', '.contact .facebooks-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'facebooks', legislators: legislatorId}, function(d) {});

  });

  // ----------------- SMOOTH SCROLL ----------------------------

  $('body').on('click', 'a[href^="#"]', function(e) {
    STS.anim.scrollToEl($($(this).attr('href')));
    e.preventDefault();
  });

  // ---------- bring in metrics -----------

  var loadedGlobals, loadedStats, socialStats;

  // ScrollHandler.addTrigger('#load-stats', bringInStats);
  TweenLite.set(".stats .metric", { transform: "scaleX(0)", opacity: 0 });

  function bringInStats()
  {
    if (!statsLoaded()) {
      setTimeout(bringInStats, 100);
    } else {
      animateStats();
    }

    ScrollHandler.removeTrigger(bringInStats);
  }

  function animateStats()
  {
    TweenMax.staggerFromTo(".stats .metric", 0.2, { transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }, 0.2);

    $('.email-total').numberSpinner('set', loadedGlobals.emails || 0);
    $('.call-total').numberSpinner('set', loadedGlobals.calls || 0);
    $('.view-total').numberSpinner('set', loadedGlobals.views || 0);
    $('.facebook-total').numberSpinner('set', socialStats.facebook || 0);
    $('.google-total').numberSpinner('set', socialStats.googleplus || 0);
    $('.twitter-total').numberSpinner('set', socialStats.twitter || 0);

    // shade the stats map if we have enough stats for it to say something
    var grandtotal = STS.getTotal(loadedGlobals);
    if (grandtotal > MAP_START_SHADING) {
      STS.CampaignMap.shadeWardStats(grandtotal, loadedStats);
    }
  }

  function statsLoaded()
  {
    return loadedGlobals !== undefined && loadedStats !== undefined && socialStats !== undefined;
  }

  function onStatsLoaded(data)
  {
    var globals, i, l, rep;

    for (i = 0, l = data.length; i < l && (rep = data[i]); ++i) {
      if (rep._id === 'overall_totals') {
        globals = rep;
        break;
      }
    }

    // update numbers if we've already shown the stats
    if (statsLoaded()) {
      $('.email-total').numberSpinner('set', globals.emails || 0);
      $('.call-total').numberSpinner('set', globals.calls || 0);
      $('.view-total').numberSpinner('set', globals.views || 0);

      // shade the stats map if we have enough stats for it to say something
      var grandtotal = STS.getTotal(globals);
      if (grandtotal > MAP_START_SHADING) {
        STS.CampaignMap.shadeWardStats(grandtotal, data);
      }
    }

    loadedStats = data;
    loadedGlobals = globals;
  }

  // ------------------------------ LOAD DATA ----------------------------------

  // GET AGGREGATE TOTALS

  io.api('stats', STATS_READ_URL, null, function(stats) {
    STS.events.onStatsLoad(stats);
  });

  // GET SOCIAL TOTALS

  $.ajax(SOCIAL_STATS_URL, {
      success: function(res, err) {
        socialStats = res;
      },
      dataType: 'jsonp',
      cache         : true,
      jsonpCallback : 'myCallback'
  });

  // SEND AN EMAIL (TEST ONLY)

  // $.ajax({
  //   url: SEND_EMAIL_URL,
  //   type: "POST",

  //   contentType: "application/json",
  //   crossDomain: true,
  //   dataType: 'json',

  //   data: '{"some":"json"}',
  //   // work with the response
  //   success: function( res ) {
  //     console.log(res)
  //   }
  // });

  // init live counter widgets

  $('.email-total, .call-total, .view-total, .facebook-total, .google-total, .twitter-total').addClass('number-spinner').numberSpinner({
      min_digits: 6
    });
  $('.tweets-support-total').addClass('number-spinner').numberSpinner();

  // LOG INITIAL VIEW

  io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'views'}, function(d) {});

  // -------------------------------- EXPORTS ----------------------------------

  STS.events.onStatsLoad = onStatsLoaded;

  STS.getTotal = function(stats)
  {
    return (stats.emails || 0) + (stats.calls || 0) + (stats.views || 0) + (stats.tweets || 0) + (stats.facebooks || 0);
  };

});

})(jQuery, STS.app);
