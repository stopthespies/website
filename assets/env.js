// Main application IoC container
var STS = {
  options: {
    ENABLE_REALTIME         : 1,
    SOCKET_CONNECT_TIMEOUT  : 500,

    LEGISLATORS_LOCATOR_URL : 'http://legislators-locator.herokuapp.com/',
    SOCIAL_STATS_URL        : 'https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net',

    API_BASE_URL            : 'http://stopthespies-api.herokuapp.com:80',

    TWEETS_READ_URL         : 'http://stopthespies-api.herokuapp.com:80/tweets',
    STATS_READ_URL          : 'http://stopthespies-api.herokuapp.com:80/stats',

    SEND_EMAIL_URL          : 'http://stopthespies-api.herokuapp.com:80/email',
    LOG_URL_BASE            : 'http://stopthespies-api.herokuapp.com:80/log'
  },
  events: {}
};
