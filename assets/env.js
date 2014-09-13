// Main application IoC container
var STS = {
  options: {
    ENABLE_REALTIME         : 1,
    SOCKET_CONNECT_TIMEOUT  : 500,

    LEGISLATORS_LOCATOR_URL : 'http://legislators-locator.herokuapp.com/',
    SOCIAL_STATS_URL        : 'https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net',

    API_BASE_URL            : 'http://localhost:5000',

    TWEETS_READ_URL         : 'http://localhost:5000/tweets',
    STATS_READ_URL          : 'http://localhost:5000/stats',

    SEND_EMAIL_URL          : 'http://localhost:5000/email',
    LOG_URL_BASE            : 'http://localhost:5000/log'
  },
  events: {}
};
