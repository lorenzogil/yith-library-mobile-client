import Ember from 'ember';

export default Ember.Component.extend({

    didInsertElement: function () {
        window.addEventListener('offline', this);
        window.addEventListener('online', this);
    },

    handleEvent: function (event) {
        switch (event.type) {
        case 'offline':
            this.sendAction('offline');
            break;
        case 'online':
            this.sendAction('online');
            break;
        }
    },

    willDestroy: function () {
        window.removeEventListener('offline', this);
        window.removeEventListener('online', this);
    }
});
