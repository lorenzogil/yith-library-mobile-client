'use strict';

App.Router.map(function () {
    this.resource('secrets', {'queryParams': ['tag']}, function () {
        this.resource('secret', {path: '/:secret_id'});
    });
});


App.IndexRoute = Ember.Route.extend({
    beforeModel: function () {
        this.transitionTo('secrets');
    }
});


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
