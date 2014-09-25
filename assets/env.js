// Main application IoC container
var STS = {
  options: {
    BASEURL                 : '',

    ENABLE_REALTIME         : 1,
    SOCKET_CONNECT_TIMEOUT  : 500,

    LEGISLATORS_LOCATOR_URL : 'https://legislators.stopthespies.org',
    SOCIAL_STATS_URL        : 'https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=https://shutthebackdoor.net',

    API_BASE_URL            : 'https://api.stopthespies.org:80',

    TWEETS_READ_URL         : 'https://api.stopthespies.org:80/tweets',
    STATS_READ_URL          : 'https://api.stopthespies.org:80/stats',

    SEND_EMAIL_URL          : 'https://api.stopthespies.org:80/email',
    LOG_URL_BASE            : 'https://api.stopthespies.org:80/log',

    USER_PROGRESS_COOKIE_LIFETIME : 28 * 24 * 3600 // ~1 month
  },
  events: {}
};
