'use strict';

App.Settings = Ember.Object.extend({

    defaults: {
        'serverBaseUrl': 'http://127.0.0.1:6543'
    },

    getSetting: function (name) {
        var setting = window.localStorage.getItem(name);
        if (setting === null) {
            return this.defaults[name] || null;
        } else {
            return JSON.parse(setting);
        }
    },

    setSetting: function (name, value) {
        var serialized = JSON.stringify(value);
        return window.localStorage.setItem(name, serialized);
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
