'use strict';

window.App = Ember.Application.create();

//App.ApplicationAdapter = DS.FixtureAdapter.extend();
App.ApplicationAdapter = DS.IndexedDBAdapter.extend({
    databaseName: 'yithlibrary',
    version: 1,
    migrations: function () {
        this.addModel(App.Secret);
        this.addModel(App.Tag);
    }
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
