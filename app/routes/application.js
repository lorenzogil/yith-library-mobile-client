import Ember from 'ember';

export default Ember.Route.extend({

    settings: Ember.inject.service('settings'),

    model: function () {
        var settings = this.get('settings'),
            lastAccount = settings.getSetting('lastAccount');
        if (lastAccount) {
            return this.store.find('account', lastAccount);
        } else {
            return null;
        }
    },

    afterModel: function (model) {
        if (model === null) {
            this.transitionTo('firstTime');
        }
    }
});
