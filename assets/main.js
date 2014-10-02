
// -- require vendor/bootstrap.min


















// -- require randoms


// -- require takeover
// -- require eyes




var legislators = {}; // Too lazy to pass this variable around to modals ATM - TODO

(function($, io, opts) {

var
  LEGISLATORS_LOCATOR_URL = STS.options.LEGISLATORS_LOCATOR_URL,

  TWEETS_READ_URL     = STS.options.TWEETS_READ_URL,
  STATS_READ_URL      = STS.options.STATS_READ_URL,
  SHARES_READ_URL     = STS.options.SHARES_READ_URL,

  SEND_EMAIL_URL      = STS.options.SEND_EMAIL_URL,
  LOG_URL_BASE      = STS.options.LOG_URL_BASE,

  SIDE_SHAREBOX_START_WIDTH = 430,    // :IMPORTANT: must match CSS value for $show-sharebox

  MAP_START_SHADING = 1;   // this many actions to occur before we begin weighted shading of the campaign stats map

// Start up scripts
$(function() {

var statHoverActive = false;  // prevent map shading updating while hovering a particular stat

  // ----------------- POPOVERS ----------------------------

  $('.ourselves div').tooltipster();

  // ----------------- MODALS ----------------------------

  $('body').on('click', '.contact .call-action', function (e) {
/* :TODO: need more data first
    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var callModalTemplate = $('#call-modal-template').html();
    //$('#call-modal-container').html(_.template(callModalTemplate, legislator));
    //$('#call-modal-container .modal').modal();
    var takeoverContent = _.template(callModalTemplate, legislator);
    takeover(takeoverContent);
*/

    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');

    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {
      'event' : 'calls',
      legislators: legislatorId,
      repeat : Cookie.has('called-' + legislatorId)
    }, function(d) {});
    Cookie.set('called-' + legislatorId, 1);
  });

  $('body').on('click', '.contact .email-action', function (e) {
/* :TODO: need confirmation of legality first
    var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
    var legislator = legislators[legislatorId];
    var emailModalTemplate = $('#email-modal-template').html();
    //$('#email-modal-container').html(_.template(emailModalTemplate, legislator));
    //$('#email-modal-container .modal').modal();

    var takeoverContent = _.template(emailModalTemplate, legislator);
    takeover(takeoverContent);
*/

    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');

    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {
      'event' : 'emails',
      legislators: legislatorId,
      repeat : Cookie.has('emailed-' + legislatorId)
    }, function(d) {});
    Cookie.set('emailed-' + legislatorId, 1);
  });

  $('body').on('click', '.contact .tweets-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');

    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {
      'event' : 'tweets',
      legislators: legislatorId,
      repeat : Cookie.has('tweeted-' + legislatorId)
    }, function(d) {});
    Cookie.set('tweeted-' + legislatorId, 1);
  });

  $('body').on('click', '.contact .facebooks-action', function (e) {
    var legislatorId = $(e.currentTarget).parents('[data-legislator-id]').attr('data-legislator-id');

    io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {
      'event' : 'facebooks',
      legislators: legislatorId,
      repeat : Cookie.has('facebooked-' + legislatorId)
    }, function(d) {});
    Cookie.set('facebooked-' + legislatorId, 1);
  });

  // ----------------- SMOOTH SCROLL ----------------------------

  $('body').on('click', 'a[href^="#"]', function(e) {
    var link = $(this).attr('href');
    STS.anim.scrollToEl($(link), 0.3, function() {
      window.location.hash = link;
    });
    e.preventDefault();
  });

  // ---------- bring in metrics -----------

  var legislatorGlobalStats, legislatorStats, socialStats;

  ScrollHandler.addTrigger('#load-stats', bringInStats);
  TweenLite.set(".stats .animate", { transform: "scaleX(0)", opacity: 0 });

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
    TweenMax.staggerFromTo(".stats .animate", 0.2, { transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }, 0.2);

    $('.visit-total').numberSpinner('set', legislatorGlobalStats.visits || 0);
    $('.email-total').numberSpinner('set', legislatorGlobalStats.emails || 0);
    $('.call-total').numberSpinner('set', legislatorGlobalStats.calls || 0);
    $('.view-total').numberSpinner('set', legislatorGlobalStats.views || 0);
    $('.facebook-total').numberSpinner('set', legislatorGlobalStats.facebooks || 0);
    $('.twitter-total').numberSpinner('set', legislatorGlobalStats.tweets || 0);

    // shade the stats map if we have enough stats for it to say something
    var grandtotal = STS.getTotal(legislatorGlobalStats);
    if (grandtotal > MAP_START_SHADING) {
      STS.CampaignMap.shadeWardStats(grandtotal, legislatorStats);
    }

    // bind hover events to metrics
    $('.stats .metric').hover(debounce(function(e) {
      statHoverActive = $(this).data('stat');
      STS.CampaignMap.shadeWardStats(grandtotal, legislatorStats, statHoverActive);
    }), debounce(function(e) {
      statHoverActive = false;
      STS.CampaignMap.shadeWardStats(grandtotal, legislatorStats);
    }));
  }

  function statsLoaded()
  {
    return legislatorGlobalStats !== undefined && legislatorStats !== undefined;
  }

  function onStatsLoaded(data)
  {
    var globals, i, l, rep;

    for (i = 0, l = data.length; i < l && (rep = data[i]); ++i) {
      if (rep._id === 'overall_totals') {
        globals = rep;
        break;
      }
    }

    // update numbers if we've already shown the stats
    if (statsLoaded()) {
      $('.visit-total').numberSpinner('set', globals.visits || 0);
      $('.email-total').numberSpinner('set', globals.emails || 0);
      $('.call-total').numberSpinner('set', globals.calls || 0);
      $('.view-total').numberSpinner('set', globals.views || 0);
      $('.facebook-total').numberSpinner('set', globals.facebooks || 0);
      $('.twitter-total').numberSpinner('set', globals.tweets || 0);

      // shade the stats map if we have enough stats for it to say something
      var grandtotal = STS.getTotal(globals);
      if (grandtotal > MAP_START_SHADING) {
        STS.CampaignMap.shadeWardStats(grandtotal, data, statHoverActive);
      }
    }

    legislatorStats = data;
    legislatorGlobalStats = globals;
  }

  function onSharesLoaded(stats)
  {
    var firstLoad = !socialStats;

    // assign social stats for stats section (deferred until animated in)
    socialStats = stats;

    function applyValues()
    {
      // apply to share panels
      $('.facebook-share-total').numberSpinner('set', socialStats.facebook || 0);
      $('.google-share-total').numberSpinner('set', socialStats.googleplus || 0);
      $('.twitter-share-total').numberSpinner('set', socialStats.twitter || 0);
    }

    // sploosh.
    var timeline = new TimelineMax({});

    if ($(window).width() > SIDE_SHAREBOX_START_WIDTH) {
      if (firstLoad) {
        var shareboxs = $('.sharbx .share').addClass('anim');
        var maxLeft = shareboxs.outerWidth() - ($(window).innerWidth() - shareboxs.offset().left);
        timeline.eventCallback('onComplete', function() {
          shareboxs.css('left', '').removeClass('anim');
        });
        timeline.staggerTo('.sharbx .share', 0.5, { left: -maxLeft, onComplete: applyValues }, 0.4);
        timeline.staggerTo('.sharbx .share', 0.4, { delay: 1.5, left: 0 }, 0.3);
      } else {
        timeline.staggerTo('.sharbx .share', 0.5, { left: -10, onComplete: function() {
          shareboxs.css('left', '');
        }}, 0.4);

        applyValues();
      }
    }
    // :NOTE: no share counters *anywhere* else on mobile so we don't need to run applyValues. Don't run it on the sharebox.
  }

  // ------------------------------ LOAD DATA ----------------------------------

  // GET AGGREGATE TOTALS

  io.api('stats', STATS_READ_URL, null, onStatsLoaded);

  // GET SOCIAL TOTALS

  io.api('shares', SHARES_READ_URL, null, onSharesLoaded);

  // init live counter widgets

  $('.number-spinner.pad').numberSpinner({
      min_digits: 6
    });
  $('.number-spinner:not(.pad)').numberSpinner();

  // LOG INITIAL VIEW

  io.api('log', {url: LOG_URL_BASE, method: 'POST'}, {'event' : 'visits', 'repeat' : Cookie.has('already-viewed')}, function(d) {});
  Cookie.set('already-viewed', 1);

  // -------------------------------- EXPORTS ----------------------------------

  STS.events.onStatsLoad = onStatsLoaded;
  STS.events.onSharesLoad = onSharesLoaded;

  STS.getTotal = function(stats, statset, includeviews)
  {
    if (!statset || statset === 'all') {
      return (stats.emails || 0) + (stats.calls || 0) + ((includeviews ? stats.views : 0) || 0) + (stats.tweets || 0) + (stats.facebooks || 0);
    }
    return stats[statset];
  };

});

// window resize

$(window).on('resize', debounce(function(e) {
  var $this, val, opts;

  // redraw spinners
  $('.number-spinner').each(function() {
    $this = $(this);
    val = $this.numberSpinner('get');
    opts = $this.numberSpinner('options');
    $this.numberSpinner('destroy');
    $this.numberSpinner(opts).numberSpinner('set', val);
  });
}));

})(jQuery, STS.app, STS.options);
