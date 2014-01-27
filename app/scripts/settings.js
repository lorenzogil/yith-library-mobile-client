'use strict';

App.Settings = Ember.Object.extend({

    getSetting: function (name) {
        return window.localStorage.getItem(name);
    },

    setSetting: function (name, value) {
        return window.localStorage.setItem(name, value);
    }

});

Ember.Application.initializer({
    name: 'settings',

    initialize: function (container, application) {
        application.register('settings:main', application.Settings);
    }
});

Ember.Application.initializer({
    name: 'injectSettings',
    before: 'settings',

    initialize: function (container, application) {
        application.inject('route', 'settings', 'settings:main');
        application.inject('controller', 'settings', 'settings:main');
    }
});
