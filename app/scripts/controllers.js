'use strict';

App.SecretsController = Ember.ArrayController.extend({
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: '',
    state: 'drawer-closed',

    actions: {
        openDrawer: function () {
            this.set('state', 'drawer-opened');
            this.transitionToRoute('secrets.drawer');
        },

        drawerTransitionEnd: function () {
            if (this.get('state') === 'drawer-closed') {
                this.transitionToRoute('secrets.index');
            }
        },

        openSecret: function () {
            this.set('position', 'left');
        },

        closeSecret: function () {
            this.set('position', 'current');
        },

        secretAnimationEnd: function () {
            console.log('animation end ' + this.get('position'));
            if (this.get('position') === 'current') {
                this.transitionToRoute('secrets.index');
            }
        }
    }
});

App.SecretController = Ember.ObjectController.extend({
    needs: ['secrets']
});

App.SecretsDrawerController = Ember.ObjectController.extend({
    needs: ['secrets'],

    actions: {
        closeDrawer: function () {
            var secretsController = this.get('controllers.secrets');
            secretsController.set('state', 'drawer-closed');
        }
    }
});

App.TagsController = Ember.ArrayController.extend();
