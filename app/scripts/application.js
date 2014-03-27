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


App.snakeCaseToCamelCase = function (symbol) {
    return symbol.split('_').filter(function (word) {
        return word !== '';
    }).map(function (word, idx) {
        if (idx === 0) {
            return word;
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }).join('');
};
