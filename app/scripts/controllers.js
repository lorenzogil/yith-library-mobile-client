'use strict';

App.SecretsController = Ember.ArrayController.extend({
    sortProperties: ['service', 'account'],
    sortAscending: true
});
