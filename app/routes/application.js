import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        var lastAccount = this.settings.getSetting('lastAccount');
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
