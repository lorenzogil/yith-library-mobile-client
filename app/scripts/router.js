'use strict';

App.Router.map(function () {
    this.route('login', {path: '/login'});
    this.route('sync', {path: '/sync'});
    this.resource('secrets', {path: '/secrets', queryParams: ['tag']}, function () {
        this.resource('secret', {path: '/:secret_id'});
    });
});


App.IndexRoute = Ember.Route.extend({
    beforeModel: function () {
        var lastSync = this.settings.getSetting('lastSync');
        if (lastSync) {
            this.transitionTo('secrets');
        } else {
            this.transitionTo('sync');
        }
    }
});


App.LoginRoute = Ember.Route.extend();

App.SyncRoute = Ember.Route.extend({

    beforeModel: function (transition) {
        var loginController = this.controllerFor('login'),
            oauth = loginController.get('oauth'),
            accessToken = oauth.getAccessToken(),
            isExpired = oauth.accessTokenIsExpired();
        if (accessToken === null || isExpired) {
            loginController.set('previousTransition', transition);
            this.transitionTo('login');
        }
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
    },

    actions: {
        sync: function () {
            this.transitionTo('sync');
        }
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
