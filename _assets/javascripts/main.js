//= require polyfills
//= require helpers

//= require env

//= require animations
//= require event-handler
//= require scroll-handler
//= require map
//= require randoms
//= require legislator-querying
//= require tweets
//= require takeover

//= require vendor/jquery.numberSpinner/src/jquery.numberSpinner.js

var legislators = {}; // Too lazy to pass this variable around to modals ATM - TODO

(function($, io) {

var
  LEGISLATORS_LOCATOR_URL = STS.options.LEGISLATORS_LOCATOR_URL,
  SOCIAL_STATS_URL    = STS.options.SOCIAL_STATS_URL,

  TWEETS_READ_URL     = STS.options.TWEETS_READ_URL,
  STATS_READ_URL      = STS.options.STATS_READ_URL,

  SEND_EMAIL_URL      = STS.options.SEND_EMAIL_URL,
  LOG_URL_BASE      = STS.options.LOG_URL_BASE;

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

    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var callModalTemplate = $('#call-modal-template').html();
    //$('#call-modal-container').html(_.template(callModalTemplate, legislator));
    //$('#call-modal-container .modal').modal();
    var takeoverContent = _.template(callModalTemplate, legislator);
    takeover(takeoverContent);

    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'calls', legislators: legislatorId}, function(d) {
      if (d.message) {
        console.log('Logged legislator call');
      } else {
        console.log('Error logging legislator call');
      }
    });

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
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'emails', legislators: legislatorId}, function(d) {
      if (d.message) {
        console.log('Logged legislator email');
      } else {
        console.log('Error logging legislator email');
      }
    });

  });

  $('body').on('click', '.contact .tweets-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'tweets', legislators: legislatorId}, function(d) {
      if (d.message) {
        console.log('Logged legislator tweet');
      } else {
        console.log('Error logging legislator tweet');
      }
    });

  });

  $('body').on('click', '.contact .facebooks-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');
    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'facebooks', legislators: legislatorId}, function(d) {
      if (d.message) {
        console.log('Logged legislator facebook');
      } else {
        console.log('Error logging legislator facebook');
      }
    });

  });

  // ----------------- SMOOTH SCROLL ----------------------------

  $('body').on('click', 'a[href^="#"]', function(e) {
    STS.anim.scrollToEl($($(this).attr('href')));
    e.preventDefault();
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

    ScrollHandler.removeTrigger(bringInStats);
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
    data = data[0];   // comes back as an array from API and global stats is only 1 record

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

  io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'views'}, function(d) {
    if (d.message) {
      console.log('Logged pageview');
    } else {
      console.log('Error logging pageview');
    }
  });

  // -------------------------------- EXPORTS ----------------------------------

  STS.events.onStatsLoad = onStatsLoaded;

});

})(jQuery, STS.app);
