/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
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
      clientId: 'd866fbc8-a367-44a2-9d6f-8ae2ffbd2748',
      clientBaseUrl: 'http://192.168.2.5:4200',
      serverBaseUrl: 'http://192.168.2.5:6543'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      version: '@@projectVersion'
    }
  };

  if (environment === 'development') {
    // LOG_MODULE_RESOLVER is needed for pre-1.6.0
    ENV.LOG_MODULE_RESOLVER = true;

    ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_MODULE_RESOLVER = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'production') {
    ENV.defaults.clientId = '58c09352-b208-4add-83b7-0dc75d0c8ee3';
    ENV.defaults.clientBaseUrl = 'https://yithlibrary-mobileclient.herokuapp.com';
    ENV.defaults.serverBaseUrl = 'https://yithlibrary.herokuapp.com';
  }

  return ENV;
};
