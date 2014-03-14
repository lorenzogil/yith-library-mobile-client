'use strict';

App.Settings = Ember.Object.extend({

    defaults: {
        'serverBaseUrl': 'http://127.0.0.1:6543'
    },

    getSetting: function (name) {
        var setting = window.localStorage.getItem(name);
        if (setting === null) {
            setting = this.defaults[name] || null;
        }
        return setting;
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
