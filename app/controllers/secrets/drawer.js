import Ember from 'ember';

export default Ember.Controller.extend({
    application: Ember.inject.controller(),
    auth: Ember.inject.service('auth'),
    secrets: Ember.inject.controller(),
    sortProperties: ['count:desc'],
    sortedTags: Ember.computed.sort('content', 'sortProperties'),
    tagsToDisplay: 5,
    tag: Ember.computed.alias('secrets.tag'),

    accountDisplayName: function () {
        return this.get('application.model.displayName');
    }.property('application.model.displayName'),

    selectedTagCount: function () {
        var tag = this.get('sortedTags').findBy('name', this.get('tag'));
        if (tag) {
            return tag.get('count');
        } else {
            return 0;
        }
    }.property('sortedTags.[]', 'tag'),

    mostUsedTags: function () {
        var tags = this.get('sortedTags');
        var mostUsed = tags.slice(0, this.get('tagsToDisplay'));
        var selectedTag = this.get('tag');
        var foundSelectedTag = false;
        var wrapped = mostUsed.map(function (element) {
            var name = element.get('name');
            if (name === selectedTag) {
                foundSelectedTag = true;
            }
            return {
                'name': name,
                'count': element.get('count'),
                'selectTag': name === selectedTag ? '' : name
            };
        });
        if (!foundSelectedTag && selectedTag !== '') {
            wrapped.pop();
            wrapped.push({
                'name': selectedTag,
                'count': this.get('selectedTagCount'),
                'selectTag': ''
            });
        }
        return wrapped;
    }.property('selectedTagCount', 'sortedTags.[]', 'tag', 'tagsToDisplay'),

    hasMoreTags: function () {
        return this.get('sortedTags').length > this.get('tagsToDisplay');
    }.property('sortedTags.[]', 'tagsToDisplay'),

    hasValidAccessToken: function () {
        return this.get('auth.hasValidAccessToken');
    }.property('auth.hasValidAccessToken'),

    syncButtonDisabled: function () {
        return this.get('secrets.isSyncing') || !this.get('secrets.isOnline');
    }.property('secrets.isSyncing', 'secrets.isOnline'),

    loginButtonDisabled: function () {
        return !this.get('isOnline');
    }.property('secrets.isOnline'),

    actions: {
        login: function () {
            this.transitionToRoute('secrets');
            Ember.run.next(this, function () {
                this.get('secrets').authorizeInServer();
            });
        },

        sync: function () {
            this.transitionToRoute('secrets');
            Ember.run.next(this, function () {
                this.get('secrets').syncFromServer();
            });
        },

        logout: function () {
            this.transitionToRoute('secrets');
            Ember.run.next(this, function () {
                this.get('secrets').logout();
            });
        }
    }

});
