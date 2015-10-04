/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'yith-library-mobile-client',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    defaults: {
      clientId: '67c2348d-f040-4baa-b7fa-9ab3ec6ac903',
      clientBaseUrl: 'http://tyrion:4200',
      serverBaseUrl: 'https://www.yithlibrary.com'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      version: '@@projectVersion'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

    ENV.defaults.clientId = '2c48642d-6113-4fa3-949d-5a5922ed1ff1';
    ENV.defaults.clientBaseUrl = 'https://mobile.yithlibrary.com';
    ENV.defaults.serverBaseUrl = 'https://www.yithlibrary.com';
  }

  return ENV;
};
