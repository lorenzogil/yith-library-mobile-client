'use strict';

App.SecretsController = Ember.ArrayController.extend({
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: '',
    state: 'drawer-closed'
});

App.SecretController = Ember.ObjectController.extend({
    needs: ['secrets']
});

App.SecretsDrawerController = Ember.ObjectController.extend({
    needs: ['secrets'],

    actions: {
        secrets: function () {
            var self = this;
            var secretsController = this.get('controllers.secrets');
            secretsController.set('state', 'drawer-closed');
            // TODO: use a helper view to transitionToRoute
            // at the end of the an
            Ember.run.later(function () {
                self.transitionToRoute('secrets');
            }, 400);

        }
    }
});

App.TagsController = Ember.ArrayController.extend();
