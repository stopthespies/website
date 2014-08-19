





(function($) {

var
  LEGISLATORS_LOCATOR_URL = "http://legislators-locator.herokuapp.com/",
  SOCIAL_STATS_URL    = "https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net",
  TWEETS_READ_URL     = "http://stopthespies-api.herokuapp.com/tweets",
  STATS_READ_URL      = "http://stopthespies-api.herokuapp.com/stats",

  SEND_EMAIL_URL      = "http://stopthespies-api.herokuapp.com/email",
  LOG_URL_BASE      = "http://stopthespies-api.herokuapp.com/log?event="
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

  TweenMax.staggerFromTo(".stats .metric", 0.2, { transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }, 0.2);

  // GET AGGERGATE TOTALS

  $.ajax({
    url: STATS_READ_URL,
    jsonp: "callback",
    dataType: "jsonp",
    // work with the response
    success: function( res ) {
        $('.email-total').text(res.emails);
        $('.call-total').text(res.calls);
        $('.view-total').text(res.views);
    }
  });

  // GET SOCIAL TOTALS

  $.ajax(SOCIAL_STATS_URL, {
      success: function(res, err) {

        $('.facebook-total').text(res.facebook);
        $('.google-total').text(res.googleplus);
        $('.twitter-total').text(res.twitter);
      },
      dataType: 'jsonp',
      cache         : true,
      jsonpCallback : 'myCallback'
  });

  // GET TWEETS

  var tweetTemplate = $('#tweet-template').html();
  $.ajax({
    url: TWEETS_READ_URL,
    jsonp: "callback",
    dataType: "jsonp",
    // work with the response
    success: function( tweets ) {
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

  // LOG INITIAL VIEW

  $.ajax({
    url: LOG_URL_BASE + "views",
    jsonp: "callback",
    dataType: "jsonp",
    // work with the response
    success: function( res ) {
    }
  });

});

})(jQuery);


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
