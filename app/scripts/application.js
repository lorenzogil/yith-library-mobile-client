'use strict';

window.App = Ember.Application.create();

App.ApplicationAdapter = DS.FixtureAdapter.extend();

// Stop the loading of Ember until we load the IndexedDB
// in the models.js file.
App.deferReadiness();
