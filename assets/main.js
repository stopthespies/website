













var legislators = {}; // Too lazy to pass this variable around to modals ATM - TODO

(function($, io) {

var
  LEGISLATORS_LOCATOR_URL = 'http://legislators-locator.herokuapp.com/',
  SOCIAL_STATS_URL    = 'https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net',

  TWEETS_READ_URL     = 'http://stopthespies-api.herokuapp.com:80/tweets',
  STATS_READ_URL      = 'http://stopthespies-api.herokuapp.com:80/stats',

  SEND_EMAIL_URL      = 'http://stopthespies-api.herokuapp.com:80/email',
  LOG_URL_BASE      = 'http://stopthespies-api.herokuapp.com:80/log?event='
;

// Start up scripts
$(function() {

  // ----------------- POP OVERS ----------------------------

  $('.metric').popover({
    trigger: 'hover',
    container: 'body',
    placement: 'top'
  });

  // ----------------- MODALS ----------------------------

  $('body').on('click', '.contact .call-action', function (e) {
    /*
    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var callModalTemplate = $('#call-modal-template').html();
    $('#call-modal-container').html(_.template(callModalTemplate, legislator));
    $('#call-modal-container .modal').modal();
    */
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.emit('log', {'event' : 'emails', legislators: legislatorId});

  });

  $('body').on('click', '.contact .email-action', function (e) {
    /*
    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var emailModalTemplate = $('#email-modal-template').html();
    $('#email-modal-container').html(_.template(emailModalTemplate, legislator));
    $('#email-modal-container .modal').modal();
    */
    //$('#email-modal').modal();
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.emit('log', {'event' : 'emails', legislators: legislatorId});

  });

  $('body').on('click', '.contact .tweets-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.emit('log', {'event' : 'tweets', legislators: legislatorId});

  });

  $('body').on('click', '.contact .facebooks-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.emit('log', {'event' : 'facebooks', legislators: legislatorId});

  });

  // ---------- bring in metrics -----------

  var loadedStats, socialStats;

  ScrollHandler.addTrigger('#load-stats', bringInStats);
  TweenLite.set(".stats .metric", { transform: "scaleX(0)", opacity: 0 });

  function bringInStats()
  {
    if (!statsLoaded()) {
      setTimeout(bringInStats, 100);
    } else {
      animateStats();
    }
  }

  function animateStats()
  {
    TweenMax.staggerFromTo(".stats .metric", 0.2, { transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }, 0.2);

    $('.email-total').numberSpinner('set', loadedStats.emails || 0);
    $('.call-total').numberSpinner('set', loadedStats.calls || 0);
    $('.view-total').numberSpinner('set', loadedStats.views || 0);
    $('.facebook-total').numberSpinner('set', socialStats.facebook || 0);
    $('.google-total').numberSpinner('set', socialStats.googleplus || 0);
    $('.twitter-total').numberSpinner('set', socialStats.twitter || 0);
  }

  function statsLoaded()
  {
    return loadedStats !== undefined && socialStats !== undefined;
  }

  function onStatsLoaded(data)
  {
    if (statsLoaded()) {
      // update numbers if we've already shown the stats
      $('.email-total').numberSpinner('set', data.emails || 0);
      $('.call-total').numberSpinner('set', data.calls || 0);
      $('.view-total').numberSpinner('set', data.views || 0);
    }
    loadedStats = data;
  }

  // ------------------------------ LOAD DATA ----------------------------------

  // GET AGGREGATE TOTALS

  io.emit('stats');

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

  $.ajax({
    url: SEND_EMAIL_URL,
    type: "POST",

    contentType: "application/json",
    crossDomain: true,
    dataType: 'json',

    data: '{"some":"json"}',
    // work with the response
    success: function( res ) {
      console.log(res)
    }
  });

  // init live counter widgets

  $('.email-total, .call-total, .view-total, .facebook-total, .google-total, .twitter-total, \
    .tweets-support-total').addClass('number-spinner').numberSpinner();

  // LOG INITIAL VIEW

  io.emit('log', {'event' : 'views'});

  // -------------------------------- EXPORTS ----------------------------------

  STS.events.onStatsLoad = onStatsLoaded;

});

})(jQuery, STS.app);
