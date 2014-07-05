import Ember from 'ember';

export default Ember.View.extend({
    classNames: ['full-height'],

    didInsertElement: function () {
        window.addEventListener('offline', this);
        window.addEventListener('online', this);
    },

    handleEvent: function (event) {
        switch (event.type) {
        case 'offline':
            this.get('controller').send('offline');
            break;
        case 'online':
            this.get('controller').send('online');
            break;
        }
    },

    willDestroy: function () {
        window.removeEventListener('offline', this);
        window.removeEventListener('online', this);
    }
});
