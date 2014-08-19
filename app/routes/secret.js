import Ember from 'ember';

export default Ember.Route.extend({

    transitionToSecrets: null,

    setupController: function (controller, model) {
        this._super(controller, model);
        var secretsController = this.controllerFor('secrets');
        if (secretsController.get('position') !== 'left') {
            secretsController.set('position', 'left');
        }
        controller.set('position', 'current');
    },

    actions: {
        willTransition: function (transition) {
            var secretsController = this.controllerFor('secrets');
            if (transition.targetName === 'secrets.index') {
                if (secretsController.get('position') === 'left') {
                    secretsController.set('position', 'current');
                    this.controller.set('position', 'right');
                    this.set('transitionToSecrets', transition);
                    transition.abort();
                    return false;
                }
            } else if (transition.targetName === 'secret') {
                secretsController.set('position', 'left');
                this.controller.set('position', 'current');
            }

            return true;
        },

        finishTransition: function () {
            var transition = this.get('transitionToSecrets');
            if (transition) {
                this.set('transitionToSecrets', null);
                transition.retry();
            }
        }
    }

});
