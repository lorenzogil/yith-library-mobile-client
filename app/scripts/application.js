'use strict';

window.App = Ember.Application.create();

//App.ApplicationAdapter = DS.FixtureAdapter.extend();
App.ApplicationAdapter = DS.IndexedDBAdapter.extend({
    dbName: 'yithlibrary',
    dbVersion: 1,
    models: ['secret', 'tag']
});

Ember.OAuth2.config = {
    yithlibrary: {
        clientId: 'd866fbc8-a367-44a2-9d6f-8ae2ffbd2748',
        // the authBaseUri is set in ApplicationController since
        // it depends on the settings
        redirectUri: 'http://localhost:9000/auth-callback.html',
        scope: 'read-passwords'
    }
};
