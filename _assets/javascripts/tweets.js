(function($, STS, io) {

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
    console.log('tweets:', tweetdata);
    _.each(tweetdata.latest, function(tweets, type) {
      if(type === 'celebrities') {
        tweets = tweets.slice(0,40);
        tweets = _.uniq(tweets, 'handle');
        var i = 0;
        _.each(tweets, function(tweet) {
          tweet.avatar = tweet.avatar.replace('_normal', '');
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

    $('.tweets-support-total').numberSpinner('set', tweetdata.total);

    //$('#tweet-board img').tooltipster();
    /*var container = document.querySelector('#tweet-board');
    var msnry = new Masonry( container, {
      columnWidth: 200,
      itemSelector: '.tweet'
    });*/
    $('#tweet-board').isotope({
    layoutMode: 'packery',
    itemSelector: '.tweet',
    stamp: '.stamp'
    });
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
