import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Object.extend({

    defaults: {
        'serverBaseUrl': ENV.defaults.serverBaseUrl
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
    },

    deleteSetting: function (name) {
        window.localStorage.removeItem(name);
    }

});
