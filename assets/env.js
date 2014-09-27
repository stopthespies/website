// Main application IoC container
var STS = {
  options: {
    BASEURL                 : '',

    ENABLE_REALTIME         : 1,
    SOCKET_CONNECT_TIMEOUT  : 1000,

    LEGISLATORS_LOCATOR_URL : 'https://test.stopthespies.org/legislators',

    API_BASE_URL            : 'https://test.stopthespies.org/api:443',

    TWEETS_READ_URL         : 'https://test.stopthespies.org/api:443/tweets',
    STATS_READ_URL          : 'https://test.stopthespies.org/api:443/stats',
    SHARES_READ_URL          : 'https://test.stopthespies.org/api:443/shares',

    SEND_EMAIL_URL          : 'https://test.stopthespies.org/api:443/email',
    LOG_URL_BASE            : 'https://test.stopthespies.org/api:443/log',

    USER_PROGRESS_COOKIE_LIFETIME : 28 * 24 * 3600 // ~1 month
  },
  events: {}
};
