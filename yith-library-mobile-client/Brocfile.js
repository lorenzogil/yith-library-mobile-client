/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

var app = new EmberApp({
  name: require('./package.json').name,

  // for some large projects, you may want to uncomment this (for now)
  es3Safe: true,

  minifyCSS: {
    enabled: true,
    options: {}
  },

  getEnvJSON: require('./config/environment')
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

app.import({
  development: 'vendor/ember-data/ember-data.js',
  production:  'vendor/ember-data/ember-data.prod.js'
}, {
  'ember-data': [
    'default'
  ]
});

app.import('vendor/ic-ajax/dist/named-amd/main.js', {
  'ic-ajax': [
    'default',
    'defineFixture',
    'lookupFixture',
    'raw',
    'request',
  ]
});

// Ember IndexedDB Adapter
app.import('vendor/ember-indexeddb-adapter/packages/indexeddb-adapter/lib/indexeddb_migration.js');
app.import('vendor/ember-indexeddb-adapter/packages/indexeddb-adapter/lib/indexeddb_serializer.js');
app.import('vendor/ember-indexeddb-adapter/packages/indexeddb-adapter/lib/indexeddb_smartsearch.js');
app.import('vendor/ember-indexeddb-adapter/packages/indexeddb-adapter/lib/indexeddb_adapter.js');

// SJCL
app.import('vendor/sjcl/sjcl.js');

// Building Blocks CSS
app.import('vendor/building-blocks/style/action_menu.css');
app.import('vendor/building-blocks/style/buttons.css');
app.import('vendor/building-blocks/style/confirm.css');
app.import('vendor/building-blocks/style/edit_mode.css');
app.import('vendor/building-blocks/style/headers.css');
app.import('vendor/building-blocks/style/input_areas.css');
app.import('vendor/building-blocks/style/status.css');
app.import('vendor/building-blocks/style/switches.css');
app.import('vendor/building-blocks/style_unstable/drawer.css');
app.import('vendor/building-blocks/style_unstable/lists.css');
app.import('vendor/building-blocks/style_unstable/progress_activity.css');
app.import('vendor/building-blocks/style_unstable/scrolling.css');
app.import('vendor/building-blocks/style_unstable/seekbars.css');
app.import('vendor/building-blocks/style_unstable/tabs.css');
app.import('vendor/building-blocks/style_unstable/toolbars.css');

app.import('vendor/building-blocks/style/icons.css');

app.import('vendor/building-blocks/transitions.css');

app.import('vendor/building-blocks/util.css');
app.import('vendor/building-blocks/fonts.css');
app.import('vendor/building-blocks/cross_browser.css');

// Building Blocks Images
var bbImages = pickFiles('vendor/building-blocks/style', {
    srcDir: '/',
    files: [
        '**/*.png',
    ],
    destDir: '/assets/'
});

var bbImagesUnstable = pickFiles('vendor/building-blocks/style_unstable', {
    srcDir: '/',
    files: [
        '**/*.png',
    ],
    destDir: '/assets/'
});

var bbImagesUnstable2 = pickFiles('vendor/building-blocks/style_unstable', {
    srcDir: '/',
    files: [
        '**/*.png',
    ],
    destDir: '/assets/style_unstable/'
});

// Building Blocks fonts
var firaSansFont = pickFiles('vendor/building-blocks/fonts/FiraSans', {
    srcDir: '/',
    files: ['**/*.eot', '**/*.otf', '**/*.ttf', '**/*.woff'],
    destDir: '/assets/fonts/FiraSans'
});

module.exports = mergeTrees([
    app.toTree(),
    bbImages,
    bbImagesUnstable,
    bbImagesUnstable2,
    firaSansFont
]);
