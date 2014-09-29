// Main application IoC container
var STS = {
  options: {
    ABSURL                  : 'https://test.stopthespies.org',
    BASEURL                 : '',

    ENABLE_REALTIME         : 1,
    SOCKET_CONNECT_TIMEOUT  : 1000,

    LEGISLATORS_LOCATOR_URL : 'https://test.stopthespies.org/legislators',

    API_BASE_URL            : 'https://test.stopthespies.org:443/api',
    API_SOCKET_BASEURL      : 'api/socket.io',

    TWEETS_READ_URL         : 'https://test.stopthespies.org:443/api/tweets',
    STATS_READ_URL          : 'https://test.stopthespies.org:443/api/stats',
    SHARES_READ_URL          : 'https://test.stopthespies.org:443/api/shares',

    SEND_EMAIL_URL          : 'https://test.stopthespies.org:443/api/email',
    LOG_URL_BASE            : 'https://test.stopthespies.org:443/api/log',

    USER_PROGRESS_COOKIE_LIFETIME : 28 * 24 * 3600 // ~1 month
  },
  events: {}
};
