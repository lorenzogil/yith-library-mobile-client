/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var replace = require('broccoli-replace');

var app = new EmberApp({
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
app.import('vendor/building-blocks/icons/styles/action_icons.css');
app.import('vendor/building-blocks/icons/styles/comms_icons.css');
app.import('vendor/building-blocks/icons/styles/media_icons.css');
app.import('vendor/building-blocks/icons/styles/settings_icons.css');

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

var bbIcons = pickFiles('vendor/building-blocks/icons/styles', {
    srcDir: '/',
    files: [
        '*.png',
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


// Fix image paths
var fixedPaths = replace(app.toTree(), {
    files: [
        'index.html',
        'manifest.appcache',
        'assets/vendor.css'
    ],
    patterns: [{
        match: /style_unstable\//g,
        replacement: ''
    }, {
        match: 'projectVersion',
        replacement: app.project.pkg.version
    }]
});

module.exports = mergeTrees([
    fixedPaths,
    bbImages,
    bbImagesUnstable,
    bbIcons,
    firaSansFont
]);
