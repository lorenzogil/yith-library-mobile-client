'use strict';

App.SecretsController = Ember.ArrayController.extend({
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: '',
    state: 'drawer-closed',
    tags: [],
    selectedTag: null,

    secrets: function () {
        var selectedTag = this.get('selectedTag'),
            content = this.get('content').sortBy('service', 'account');
        if (selectedTag === null) {
            return content;
        } else {
            return content.filter(function (item) {
                return item.get('tags').indexOf(selectedTag) !== -1;
            });
        }
    }.property('content.isLoaded', 'selectedTag'),

    actions: {
        openDrawer: function () {
            this.set('state', 'drawer-opened');
        },

        closeDrawer: function () {
            this.set('state', 'drawer-closed');
        },

        selectTag: function (tag) {
            var selectedTag = this.get('selectedTag');
            this.set('state', 'drawer-closed');
            if (selectedTag === tag) {
                this.set('selectedTag', null);
            } else {
                this.set('selectedTag', tag);
            }
        },

        openSecret: function () {
            this.set('position', 'left');
        },

        closeSecret: function () {
            this.set('position', 'current');
        },

        secretAnimationEnd: function () {
            if (this.get('position') === 'current') {
                this.transitionToRoute('secrets.index');
            }
        }
    }
});

App.SecretController = Ember.ObjectController.extend({
    needs: ['secrets']
});
