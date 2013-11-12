'use strict';

App.Router.map(function () {
    this.resource('secrets', {path: '/secrets'});
});


App.IndexRoute = Ember.Route.extend({
    beforeModel: function () {
        this.transitionTo('secrets');
    }
});


App.SecretsRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('secret');
    }
});
