window.LegislatorQuery || (window.LegislatorQuery = {});

(function($, io, anim) {

$(function() {

  // ----------------- GEO-BASED ----------------------

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
        url: 'http://legislators-locator.herokuapp.com/',
        jsonp: "callback",
        dataType: "jsonp",
        data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        // work with the response
        success: renderLegislators
      });
    }, onLocationError);
  }

  window.ScrollHandler.addTrigger('#request-location', askLocation);

  // ----------------- POSTCODE LOOKUP ----------------------

  $('.postcode-lookup').on('submit', function(ev){
    hideLegislatorSearch();
    var postcode = $('input', $(ev.currentTarget)).val();
    $.ajax({
      url: 'http://legislators-locator.herokuapp.com/',
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
});

// -------------------- RENDERING ----------------------

var legislatorTemplate = $('#legislator-template').html();
var retryTemplate = $('#legislator-retry-template').html();

function renderLegislators(reps) {
  var container = $('.legislators').empty();

  legislators = reps;

  // build DOM
  _.each(legislators, function (legislator) {
  	legislator.image || (legislator.image = '');	// avoid template errors with missing data :TODO: fallback image
    container.append(_.template(legislatorTemplate, legislator));
  });

  container.append(_.template(retryTemplate, {}));

  // transition in
  anim.appearVSlide(container, 0.8);
  TweenMax.staggerFromTo(".legislators .legislator", 0.3, { transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }, 0.2);

  // bind tooltips
  $('.contact li').popover({
    trigger: 'hover',
    container: 'body',
    placement: 'top'
  });

  // bind postcode search retry
  $('.retry-legislators .postcode').on('click', function(e) {
    e.preventDefault();
    resetLegislatorResults();
    showLegislatorSearch();
  });

  $('.retry-legislators .map').on('click', function(e) {
    e.preventDefault();
    // :TODO: move to and activate map
  });

  // init counters
  container.find('.number-spinner').numberSpinner();

  // request legislator counts
  var legislatorIds = _.map(reps, function(r) { return r.member_id; });
  io.emit('stats', {legislators: legislatorIds})

  // log event to the server
  io.emit('log', {
    'event' : 'views',
    'legislators' : legislatorIds.join(',')
  });
};

function setLegislatorCounts(stats)
{
  var wrapper;
  _.each(stats, function(member) {
    wrapper = $('.legislator[data-legislator-id="' + member._id + '"]');

    wrapper.find('.legislator-views').numberSpinner('set', member.views || 0).attr('data-views', member.views || 0);
    wrapper.find('.legislator-calls').numberSpinner('set', member.calls || 0).attr('data-calls', member.views || 0);
    wrapper.find('.legislator-emails').numberSpinner('set', member.emails || 0).attr('data-emails', member.views || 0);
    wrapper.find('.legislator-tweets').numberSpinner('set', member.tweets || 0).attr('data-tweets', member.views || 0);
    wrapper.find('.legislator-facebooks').numberSpinner('set', member.facebooks || 0).attr('data-facebooks', member.views || 0);
  });
}
function setLegislatorCountsIncrement(reps, eventName) {
  reps = reps.split(',');
  var wrapper;
  _.each(reps, function(member) {
    wrapper = $('.legislator[data-legislator-id="' + member + '"]');


    var newTotal = wrapper.find('.legislator-' + eventName).attr('data-' + eventName)*1+1 || 0;
    wrapper.find('.legislator-' + eventName).numberSpinner('set', newTotal);
    wrapper.find('.legislator-' +eventName).attr('data-' + eventName, newTotal || 0);




    /*
    wrapper.find('.legislator-calls').numberSpinner('set', member.calls || 0);
    wrapper.find('.legislator-emails').numberSpinner('set', member.emails || 0);
    wrapper.find('.legislator-tweets').numberSpinner('set', member.tweets || 0);
    wrapper.find('.legislator-facebooks').numberSpinner('set', member.facebooks || 0);
    */
  });
}

function hideLegislatorSearch()
{
  anim.hideVSlide($('.postcode-steps'), 0.4);
}

function showLegislatorSearch()
{
  anim.appearVSlide($('.postcode-steps'), 0.4);
}

function resetLegislatorResults()
{
  var container = $('.legislators');

  anim.hideVSlide($('.legislators'), 0.8, function onComplete(e) {
    container.empty().css('height', 'auto');
  });
}

// Hide the geo query box in case of a location error and show a message
function onLocationError()
{
  $('.postcode-steps').addClass('no-location');
  anim.hideVSlide($('.how .location-search'), 0.4);
  anim.appearVSlide($('.how .location-error'), 0.4);
}

// EXPORTS
STS.events.onLegislatorStats = setLegislatorCounts;
STS.events.onLegislatorStatsIncrement = setLegislatorCountsIncrement;

})(jQuery, STS.app, STS.anim);
