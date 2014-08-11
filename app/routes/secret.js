import Ember from 'ember';

export default Ember.Route.extend({

    transitionToSecrets: null,

    actions: {
        willTransition: function (transition) {
            var secretsController = this.controllerFor('secrets');
            if (transition.targetName === 'secrets.index') {
                if (secretsController.get('position') === 'left') {
                    secretsController.set('position', 'current');
                    this.set('transitionToSecrets', transition);
                    transition.abort();
                    return false;
                }
            }

            return true;
        },

        willCloseSecret: function () {
            this.transitionTo('secrets');
        },

        didCloseSecret: function () {
            var transition = this.get('transitionToSecrets');
            if (transition) {
                this.set('transitionToSecrets', null);
                transition.retry();
            }
        },

    }

});
