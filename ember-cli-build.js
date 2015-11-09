/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var replace = require('broccoli-replace');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    fingerprint: {
        enabled: false
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // SJCL
  app.import('bower_components/sjcl/sjcl.js');

  // Fix image paths
  var fixedPaths = replace(app.toTree(), {
    files: [
        'index.html',
        'manifest.appcache',
        'assets/vendor.css'
    ],
    patterns: [{
        match: 'projectVersion',
        replacement: app.project.pkg.version
    }, {
        match: /\{\{MANIFEST\}\}/g,
        replacement: (app.env === 'production' ? 'manifest.appcache' : '')
    }]
  });

  return mergeTrees([fixedPaths]);
};
