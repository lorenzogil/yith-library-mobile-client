export default Ember.Object.extend({

    defaults: {
        'serverBaseUrl': 'http://10.0.0.9:6543'
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
