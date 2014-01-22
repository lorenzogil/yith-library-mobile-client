'use strict';

window.App = Ember.Application.create();

//App.ApplicationAdapter = DS.FixtureAdapter.extend();
App.ApplicationAdapter = DS.IndexedDBAdapter.extend();
