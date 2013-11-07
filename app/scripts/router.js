'use strict';

App.Router.map(function () {
    this.resource('secrets', {path: '/'});
});


App.SecretsRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('secret');
    }
});
