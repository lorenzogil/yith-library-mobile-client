import Ember from 'ember';

export default Ember.Object.extend({

    defaults: {
        'serverBaseUrl': 'http://192.168.2.5:6543'
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
