// Main application IoC container
var STS = {
  options: {
    ABSURL                  : 'http://test.stopthespies.org',
    BASEURL                 : '',

    ENABLE_REALTIME         : 0,
    SOCKET_CONNECT_TIMEOUT  : 1000,

    LEGISLATORS_LOCATOR_URL : 'https://test.stopthespies.org/legislators',

    API_BASE_URL            : 'https://api.stopthespies.org:443',
    API_SOCKET_BASEURL      : '/api',

    TWEETS_READ_URL         : 'https://api.stopthespies.org:443/tweets',
    STATS_READ_URL          : 'https://api.stopthespies.org:443/stats',
    SHARES_READ_URL          : 'https://api.stopthespies.org:443/shares',

    SEND_EMAIL_URL          : 'https://api.stopthespies.org:443/email',
    LOG_URL_BASE            : 'https://api.stopthespies.org:443/log',

    USER_PROGRESS_COOKIE_LIFETIME : 28 * 24 * 3600 // ~1 month
  },
  events: {}
};
