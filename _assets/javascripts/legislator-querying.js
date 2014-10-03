window.LegislatorQuery || (window.LegislatorQuery = {});

(function($, io, anim, opts) {

var WAIT_TIME_MESSAGE = 2000,
    WAIT_TIME_SLOW_MESSAGE = 7000,
    searchWait1, searchWait2;

$(function() {

   // show international campaigns if not in australia
  $('body').on('click', '.not-in-australia', function(e) {
    anim.hideVSlide($('.not-in-australia'), 0.75, function() {
      $('.not-in-australia').remove();
    });

    anim.appearVSlide($('.not-in-australia-container'), 0.3, function () {
      anim.hideVslide($('.postcode-steps, .how.results'));
    });

    return false;
  });

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
    ScrollHandler.removeTrigger(askLocation);

    if (!("geolocation" in navigator)) {
      onLocationError();
      return;
    }

    showLocationInfoTip();

    navigator.geolocation.getCurrentPosition(function(position) {
      hideLegislatorSearch();
      watchRequestTimes();
      $.ajax({
        url: STS.options.LEGISLATORS_LOCATOR_URL,
        jsonp: "callback",
        dataType: "jsonp",
        data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        // work with the response
        success: renderLegislators,
        error: onSearchError,
        complete: onSearchComplete
      });
    }, onLocationError);
  }

  window.ScrollHandler.addTrigger('#request-location', askLocation);

  // ----------------- POSTCODE LOOKUP ----------------------

  $('.postcode-lookup').on('submit', function(ev){
    hideLegislatorSearch();
    watchRequestTimes();
    var postcode = $('input', $(ev.currentTarget)).val();
    $.ajax({
      url: STS.options.LEGISLATORS_LOCATOR_URL,
      jsonp: "callback",
      dataType: "jsonp",
      data: {
          postcode: postcode
      },
      // work with the response
      success: renderLegislators,
      error: onSearchError,
      complete: onSearchComplete
    });
    return false;
  });
});

// -------------------- RENDERING ----------------------

var legislatorTemplate = $('#legislator-template').html();

function renderLegislators(reps) {

  var container = $('.legislators').empty(), idx = 0;

  legislators = reps;

  // build DOM
  _.each(legislators, function (legislator) {
    legislator.counter = ++idx;

  	legislator.image = STS.options.BASEURL + '/img/legislators/' + legislator.person_id + '.jpg';	// :TODO: fallback image via CSS
    legislator.typeString = legislator.house == 1 ? 'member' : 'senator';

    if (legislator.contact_details && legislator.contact_details.twitter) {
      legislator.contact_details.twitter = legislator.contact_details.twitter.replace(/^(https?:\/\/)(www\\.)?twitter\.com\//, '');
    }

    container.append(_.template(legislatorTemplate, legislator));
  });

  // tooltips
  $('.contact li', container).tooltipster({
      delay: 200,
      maxWidth: 300,
      position: 'bottom',
      theme: 'tooltipster-eyes'
  });

  // bind postcode & failed search retry
  $('.retry-legislators .postcode a, .legislator-search-states .btn').off('click').on('click', function(e) {
    e.preventDefault();
    resetLegislatorResults();
    showLegislatorSearch();
  });


  // $('.retry-legislators .map').off('click').on('click', function(e) {
  //   e.preventDefault();
  //   // :TODO: move to and activate map
  // });

  // init counters
  container.find('.number-spinner').numberSpinner();

  // transition in
  anim.appearVSlide(container, 0.8, function() {
    // request legislator counts
    var legislatorIds = _.map(reps, function(r) { return r.member_id; });
    io.api('stats', STS.options.STATS_READ_URL, {legislators: legislatorIds}, function(stats) {
      STS.events.onLegislatorStats(stats);
    });

    // log event to the server
    io.api('log', {url: STS.options.LOG_URL_BASE, method: 'POST'}, {'event' : 'views', 'legislators' : legislatorIds}, function(d) {});
  });
  TweenMax.staggerFromTo(".legislators .legislator", 0.3, { transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }, 0.2);

  anim.appearVSlide($('.retry-legislators'), 0.8);
};

function setLegislatorCounts(stats)
{
  var wrapper;
  _.each(stats, function(member) {
    wrapper = $('.legislator[data-legislator-id="' + member._id + '"]');

    wrapper.find('.legislator-views').numberSpinner('set', member.views || 0).attr('data-views', member.views || 0);
    wrapper.find('.legislator-calls').numberSpinner('set', member.calls || 0).attr('data-calls', member.calls || 0);
    wrapper.find('.legislator-emails').numberSpinner('set', member.emails || 0).attr('data-emails', member.emails || 0);
    wrapper.find('.legislator-tweets').numberSpinner('set', member.tweets || 0).attr('data-tweets', member.tweets || 0);
    wrapper.find('.legislator-facebooks').numberSpinner('set', member.facebooks || 0).attr('data-facebooks', member.facebooks || 0);
  });
}
function setLegislatorCountsIncrement(reps, eventName) {
  _.each(reps, function(increment, member) {
    var wrapper = $('.legislator[data-legislator-id="' + member + '"]');

    var newTotal = wrapper.find('.legislator-' + eventName).attr('data-' + eventName)*1 + (increment || 0);
    wrapper.find('.legislator-' + eventName).numberSpinner('set', newTotal);
    wrapper.find('.legislator-' +eventName).attr('data-' + eventName, newTotal || 0);
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

  anim.hideVSlide(container, 0.8, function onComplete(e) {
    container.empty().css('height', 'auto');
  });

  anim.hideVSlide($('.retry-legislators'), 0.8);

  setLegislatorsState(null);
}

function setLegislatorsState(state)
{
  var el = $('.legislator-search-states'),
    states = $('.state:visible', el),
    theState = state ? $('.state.' + state, el) : [];

  if (theState.length) {
    states = states.not(theState);
  }

  if (states.length) {
    states.each(function() {
      anim.hideVSlide($(this), 0.8);
    });
  }
  if (theState.length) {
    anim.appearVSlide(theState, 0.8);
  }
}

function watchRequestTimes()
{
  searchWait1 = setTimeout(function() {
    setLegislatorsState('waiting');
  }, WAIT_TIME_MESSAGE);
  searchWait2 = setTimeout(function() {
    setLegislatorsState('waiting-long');
  }, WAIT_TIME_SLOW_MESSAGE);
}

function clearRequestWatches()
{
  if (searchWait1) {
    clearTimeout(searchWait1);
  }
  if (searchWait2) {
    clearTimeout(searchWait2);
  }

  searchWait1 = null;
  searchWait2 = null;
}

// Hide the geo query box in case of a location error and show a message
function onLocationError()
{
  $('.postcode-steps').addClass('no-location');
  anim.hideVSlide($('.how .location-search'), 0.4);
  TweenMax.fromTo($('.how .location-error'), 0.4, {display:'block', opacity: 0}, {opacity: 1});
}

function onSearchError()
{
  setLegislatorsState('problem');
}

window.setLegislatorsState = setLegislatorsState; // :DEBUG:

function onSearchComplete()
{
  // focus response area if we haven't previously run a search
  if (!Cookie.has('already-searched')) {
    STS.anim.scrollToEl($('#take-action'));
    Cookie.set('already-searched', 1);
  }

  clearRequestWatches();
  setLegislatorsState(null);
}

// EXPORTS
STS.events.onLegislatorStats = setLegislatorCounts;
STS.events.onLegislatorStatsIncrement = setLegislatorCountsIncrement;

})(jQuery, STS.app, STS.anim, STS.options);
