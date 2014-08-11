import Ember from 'ember';

export default Ember.Route.extend({

    model: function () {
        return this.store.find('secret');
    },

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('state', 'drawer-closed');
        controller.set('tags', this.store.find('tag'));
    },

    actions: {
        willTransition: function (transition) {
            if (transition.targetName === 'secret') {
                this.controller.set('position', 'left');
            } else if (transition.targetName === 'secrets.index') {
                this.controller.set('position', 'current');
            }
            return true;
        }
    }

});
