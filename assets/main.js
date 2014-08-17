
var
	LEGISLATORS_LOCATOR_URL	= "http://legislators-locator.herokuapp.com/",
	SOCIAL_STATS_URL		= "https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net",
	TWEETS_READ_URL			= "http://stopthespies-api.herokuapp.com/tweets",
	STATS_READ_URL			= "http://stopthespies-api.herokuapp.com/stats",

	SEND_EMAIL_URL			= "http://stopthespies-api.herokuapp.com/email",
	LOG_URL_BASE			= "http://stopthespies-api.herokuapp.com/log?event="
;

//--------------------------------------------------------------------------------

function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      func.apply(context, args);
    }, wait || 300);
  };
};

function measureH(el) { // measure things with CSS height defined as 0 & overflow hidden
  el.css({'visibility': 'hidden', 'height': 'auto'});
  var h = el.height();
  el.css({'visibility': '', 'height': ''});
  return h;
};


//--------------------------------------------------------------------------------
// location prompt
//--------------------------------------------------------------------------------

$(function() {
  var locationMarker = $('#request-location');
  var locationOffset = parseInt(locationMarker.data('offset') || 0);

  function checkScroll(e)
  {
    if ($(window).scrollTop() > locationMarker.offset().top - locationOffset) {
      askLocation();
      $(window).off('scroll', checkScroll);
    }
  }

  // jiggle the location box somewhat to draw attention back
  function showLocationInfoTip()
  {
    var icon = $('.postcode-steps .actions .fa')[0],
      tl = new TimelineLite();

    tl.fromTo(icon, 0.5, {
      top: -100,
      opacity: 0
    }, {
      top: 0,
      opacity: 1,
      ease: Bounce.easeOut,
      onComplete : function() {
        var iconClone = $(icon).clone(),
          iconOffset = $(icon).position();

        iconClone.css($.extend(iconOffset, {position: 'absolute'})).insertBefore(icon);
        TweenLite.fromTo(iconClone, 0.4, {opacity: 0.5}, {opacity: 0, transform: "scale(2.5)"});
      }
    });
  }


  function askLocation()
  {
    if (!("geolocation" in navigator)) {
      return;
    }

    showLocationInfoTip();

    navigator.geolocation.getCurrentPosition(function(position) {
      hideLegislatorSearch();
      $.ajax({
        url: LEGISLATORS_LOCATOR_URL,
        jsonp: "callback",
        dataType: "jsonp",
        data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        // work with the response
        success: renderLegislators
      });
    }, function() {
      // :TODO:
      console.error("Geo fail");
    });
  }

  $(window).on('scroll', checkScroll);
  checkScroll();

  // load up map
  window.CampaignMap.init();
});


// ----------------- LEGISLATORS CALL ----------------------------


var legislatorTemplate = $('#legislator-template').html();
var legislators = {};

var renderLegislators = function(reps) {
  var container = $('.legislators');

  legislators = reps;

  _.each(legislators, function (legislator) {
    container.append(_.template(legislatorTemplate, legislator));
  });

  TweenLite.fromTo(container[0], 0.8, {height: 0}, {height: measureH(container)});
  TweenMax.staggerFromTo(".legislators .legislator", 0.3, { transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }, 0.2);

  $('.contact li').popover({
    trigger: 'hover',
    container: 'body',
    placement: 'top'
  });

};

function hideLegislatorSearch()
{
  var div = $('.postcode-steps');
  div.css('height', div.height());
  TweenLite.to(div[0], 0.4, {opacity: 0, height: 0, onComplete: function() {
    div.remove();
  }});
}

// ----------------- FORM SUBMISSION ----------------------

$('.postcode-lookup').on('submit', function(ev){
  hideLegislatorSearch();
  var postcode = $('input', $(ev.currentTarget)).val();
  $.ajax({
    url: LEGISLATORS_LOCATOR_URL,
    jsonp: "callback",
    dataType: "jsonp",
    data: {
        postcode: postcode
    },
    // work with the response
    success: function( response ) {
        renderLegislators(response);
        console.log( response ); // server response
    }
  });
  return false;
});


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


// Start up scripts
$(function () {
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

  // SEND AN EMAIL
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
