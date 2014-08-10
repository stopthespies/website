
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

  function askLocation()
  {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
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

var renderLegislators = function(legislators) {
  _.each(legislators, function (legislator) {
    $('.legislators').append(_.template(legislatorTemplate, legislator));
  })
};

// ----------------- FORM SUBMISSION ----------------------

$('.postcode-lookup').on('submit', function(ev){
  $('.postcode-steps').fadeOut(400);
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
