'use strict';

App.Router.map(function () {
    this.route('login', {path: '/login'});
    this.resource('secrets', {'queryParams': ['tag']}, function () {
        this.resource('secret', {path: '/:secret_id'});
    });
});


App.IndexRoute = Ember.Route.extend({
    beforeModel: function () {
        var lastSync = this.settings.getSetting('lastSync');
        if (lastSync) {
            this.transitionTo('secrets');
        } else {
            this.transitionTo('login');
        }
    }
});


App.LoginRoute = Ember.Route.extend();


App.SecretsRoute = Ember.Route.extend({

    model: function () {
        return this.store.find('secret');
    },

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('state', 'drawer-closed');
        controller.set('tags', this.store.find('tag'));
    }
});


App.SecretRoute = Ember.Route.extend({
    renderTemplate: function () {
        this.render({outlet: 'secret'});
    }
});


App.SecretsDrawerRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('tag');
    },
    renderTemplate: function () {
        this.render({outlet: 'drawer'});
    }
});
