
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
        url: "http://legislators-locator.herokuapp.com/",
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
});


// ----------------- LEGISLATORS CALL ----------------------------


var legislatorTemplate = $('#legislator-template').html();
var legislators = {};

var renderLegislators = function(legislators) {
  var container = $('.legislators');

  legislators = legislators;

  _.each(legislators, function (legislator) {
    container.append(_.template(legislatorTemplate, legislator));
  });

  TweenLite.fromTo(container[0], 0.8, {height: 0}, {height: measureH(container)});
  TweenMax.staggerFromTo(".legislators .legislator", 0.3, { transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }, 0.2);
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
    url: "http://legislators-locator.herokuapp.com/",
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

$('.support img').popover({
  trigger: 'hover',
  container: 'body',
  placement: 'top'
});
$('.contact li').popover({
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
