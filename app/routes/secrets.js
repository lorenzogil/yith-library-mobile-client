import Ember from 'ember';

export default Ember.Route.extend({

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('state', '');
    },

    model: function () {
        return this.store.findAll('secret');
    },

    actions: {
        willTransition: function (transition) {
            if (transition.targetName === 'secret') {
                this.controller.set('position', 'left full-height');
            } else if (transition.targetName === 'secrets.index') {
                this.controller.set('position', 'current full-height');
                this.controller.set('state', '');
            }
            return true;
        }

    }

});
