










var legislators = {}; // Too lazy to pass this variable around to modals ATM - TODO

(function($, io) {

var
  LEGISLATORS_LOCATOR_URL = 'http://legislators-locator.herokuapp.com/',
  SOCIAL_STATS_URL    = 'https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net',

  TWEETS_READ_URL     = 'http://stopthespies-api.herokuapp.com/tweets',
  STATS_READ_URL      = 'http://stopthespies-api.herokuapp.com/stats',

  SEND_EMAIL_URL      = 'http://stopthespies-api.herokuapp.com/email',
  LOG_URL_BASE      = 'http://stopthespies-api.herokuapp.com/log?event='
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
    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var callModalTemplate = $('#call-modal-template').html();
    $('#call-modal-container').html(_.template(callModalTemplate, legislator));
    $('#call-modal-container .modal').modal();
  });

  $('body').on('click', '.contact .email-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var emailModalTemplate = $('#email-modal-template').html();
    $('#email-modal-container').html(_.template(emailModalTemplate, legislator));
    $('#email-modal-container .modal').modal();
    $('#email-modal').modal();
  });

  // ---------- bring in metrics -----------

  ScrollHandler.addTrigger('#load-stats', animateStats);

  function animateStats()
  {
    TweenMax.staggerFromTo(".stats .metric", 0.2, { transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }, 0.2);
    ScrollHandler.removeTrigger(animateStats);
  }

  function statsLoaded()
  {
    return loadedStats !== undefined && socialStats !== undefined;
  }

  function onStatsLoaded(data)
  {
    $('.email-total').numberSpinner('set', data.emails || 0);
    $('.call-total').numberSpinner('set', data.calls || 0);
    $('.view-total').numberSpinner('set', data.views || 0);
  }

  $('.email-total, .call-total, .view-total, .facebook-total, .google-total, .twitter-total').addClass('number-spinner').numberSpinner();

  // ------------------------------ LOAD DATA ----------------------------------

  // GET AGGREGATE TOTALS

  io.emit('stats');

  // GET SOCIAL TOTALS

  $.ajax(SOCIAL_STATS_URL, {
      success: function(res, err) {
        $('.facebook-total').numberSpinner('set', res.facebook || 0);
        $('.google-total').numberSpinner('set', res.googleplus || 0);
        $('.twitter-total').numberSpinner('set', res.twitter || 0);
      },
      dataType: 'jsonp',
      cache         : true,
      jsonpCallback : 'myCallback'
  });

  // GET TWEETS

  io.emit('tweets');

  var tweetTemplate = $('#tweet-template').html();

  function onTweetsLoaded(tweets)
  {
    _.each(tweets, function(tweet){
      if(tweet.category === "politician") {
        $('#politician-tweets').append(_.template(tweetTemplate, tweet));
      }
    });
    $('.support img').popover({
      trigger: 'hover',
      container: 'body',
      placement: 'top'
    });
  }

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

  // LOG INITIAL VIEW

  io.emit('log', {'event' : 'views'});

  // -------------------------------- EXPORTS ----------------------------------

  STS.events.onStatsLoad = onStatsLoaded;
  STS.events.onTweetsLoad = onTweetsLoaded;

});

})(jQuery, STS.app);


// ---------------- API SERVER TOOLS -----------------------

var log = function(options) {
  var event = options.event;
  var legislator = options.legislator || null;
  /*$.ajax({
    url: STATS_READ_URL,
    jsonp: "callback",
    dataType: "jsonp",
    // work with the response
    success: function( response ) {
        console.log( response ); // server response
    }
  });*/
};
//log({event: 'view'});
