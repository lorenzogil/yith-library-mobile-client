'use strict';

window.App = Ember.Application.create();

//App.ApplicationAdapter = DS.FixtureAdapter.extend();
App.ApplicationAdapter = DS.IndexedDBAdapter.extend({
    databaseName: 'yithlibrary',
    version: 1,
    migrations: function () {
        this.addModel(App.Account, {keyPath: 'id', autoIncrement: false});
        this.addModel(App.Secret, {keyPath: 'id', autoIncrement: false});
        this.addModel(App.Tag);
    }
});
