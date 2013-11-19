'use strict';

App.SecretsController = Ember.ArrayController.extend({
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: ''
});

App.SecretController = Ember.ObjectController.extend({
    needs: ['secrets'],
});

App.TagsController = Ember.ArrayController.extend();
