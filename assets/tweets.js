(function($, STS, io) {

  var TWEETS_TOOLTIP_WINDOW_SIZE = 820;

  // GET TWEETS

  ScrollHandler.addTrigger('#load-tweets', bringInTweets);

  function bringInTweets()
  {
    io.api('tweets', STS.options.TWEETS_READ_URL, null, function(tweets) {
      STS.events.onTweetsLoad(tweets);
    });
    ScrollHandler.removeTrigger(bringInTweets);
  }

  var tweetTemplate = $('#tweet-template').html();

  function onTweetsLoaded(tweetdata)
  {
    // rebuild DOM
    $('#tweet-board').empty();

    _.each(tweetdata.results, function(tweets, type) {
      if(type === 'latest' || type === 'followers') {
        tweets = tweets.slice(0,40);
        tweets = _.uniq(tweets, 'handle');
        var i = 0;
        _.each(tweets, function(tweet) {
          tweet.avatar = tweet.avatar.replace('_normal', '');
          tweet.avatar = tweet.avatar.replace(/^(https?:)?\/\/((\w|\.|:)+)/, STS.options.ABSURL);
          if(i % 7 == 0) {
            tweet.sizeClass = '';
            //tweet.sizeClass = 'bigger';
          } else if(i % 12 === 0) {
            tweet.sizeClass = '';
            //tweet.sizeClass = 'biggest';
          } else {
            tweet.sizeClass = '';

          }

          $('#tweet-board').append(_.template(tweetTemplate, tweet));
          i++;
        });
      };
    });

    // set total value
    $('.tweets-support-total').numberSpinner('set', tweetdata.total);

    // add hover tooltips (for low-res displays)
    $('#tweet-board .tweet').tooltipster({
      maxWidth: 250,
      offsetY: -30,
      functionBefore: function(origin, continueTooltip) {
        if ($(window).width() <= TWEETS_TOOLTIP_WINDOW_SIZE) {
          origin.tooltipster('content', origin.find('.tweet-text'));
          continueTooltip();
        }
      }
    });

    // animate them all in
    // TweenMax.staggerFromTo('#tweet-board .tweet', 0.15, { transform: "scale(0.5)", opacity: 0 }, { transform: "scale(1)", opacity: 1, ease: Elastic.easeOut }, 0.1);

    // and pack the layout
    $('#tweet-board').packery({
      itemSelector: '.tweet',
      stamp: '.stamp'
    }).packery('on', 'layoutComplete', recenterTweetGrid);
    recenterTweetGrid();
  }

  //----------------------------------------------------------------------------
  //  layout

  function recenterTweetGrid() // find max tweet dimension (tweets are floated left)
  {
    var maxR = 0, tweets = $('#tweet-board .tweet');
    if (!tweets.length) {
      return;
    }

    tweets.each(function() {
      var r = $(this).outerWidth() + $(this).position().left;

      if (r > maxR) {
        maxR = r;
      } else {
        return false;
      }
    });

    $('#tweet-board').css('width', maxR);
  }

  $(window).on('resize', function(e) {
    $('#tweet-board').css('width', '');
  });
  $(window).on('resize', debounce(recenterTweetGrid));

  //----------------------------------------------------------------------------
  //  exports

  STS.events.onTweetsLoad = onTweetsLoaded;

})(jQuery, STS, STS.app);
