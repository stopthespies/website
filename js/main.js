
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
      // :TODO: call API
      // (position.coords.latitude, position.coords.longitude);
    }, function() {
      // :TODO:
      console.error("Geo fail");
    });
  }

  checkScroll();
  $(window).on('scroll', checkScroll);
});


// ----------------- LEGISLATORS CALL ----------------------------


var legislatorTemplate = $('#legislator-template').html();

// Legislators needs to be brought down dynamically

var legislators = {
  'H6V': {
    name: 'John Brown',
    title: 'Senator',
    image: 'H6V'
  },
  'YE4': {
    name: 'Sarah Pale',
    title: 'Senator',
    image: 'YE4'
  },
  '2L6': {
    name: 'Steve Gates',
    title: 'Senator',
    image: '2L6'
  }
};

legislators = {};

$.ajax({
  url: "http://legislators-locator.herokuapp.com/",
  jsonp: "callback",
  dataType: "jsonp",
  data: {
      lat: '-27.529993400000002',
      lng: '153.0397888'
  },
  // work with the response
  success: function( response ) {
      console.log( response ); // server response
  }
});

var renderLegislators = function(legislators) {
  _.each(legislators, function (legislator) {
    $('.legislators').append(_.template(legislatorTemplate, legislator));
  })
};

renderLegislators(legislators);

// ----------------- FORM SUBMISSION ----------------------

$('.postcode-lookup').on('submit', function(ev){
  console.log('asd');
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
