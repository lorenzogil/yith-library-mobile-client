import Ember from 'ember';

export default Ember.Route.extend({

    transitionToSecrets: null,

    setupController: function (controller, model) {
        this._super(controller, model);
        this.controllerFor('secrets').set('state', 'drawer-opened');
    },

    model: function () {
        return this.store.findAll('tag');
    },

    renderTemplate: function () {
        this.render({outlet: 'drawer'});
    },

    actions: {
        willTransition: function (transition) {
            var secretsController = this.controllerFor('secrets');
            if (transition.targetName === 'secrets.index') {
                // when the transition is retried (see finishTransition)
                // this if condition will be false
                if (secretsController.get('state') === 'drawer-opened') {
                    secretsController.set('state', '');
                    this.set('transitionToSecrets', transition);

                    // abort the transition until the CSS transition finishes
                    transition.abort();
                    return false;
                }
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
