import Ember from 'ember';

export default Ember.ArrayController.extend({
    queryParams: ['tag'],
    needs: ['application'],
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: '',
    state: 'drawer-closed',
    tags: [],
    tagsToDisplay: 5,
    tagsSortProperties: ['count:desc'],
    sortedTags: Ember.computed.sort('tags', 'tagsSortProperties'),
    tag: '',
    query: '',
    isSyncing: false,
    isAuthorizing: false,
    statusMessage: null,
    isOnline: navigator.onLine,

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
    }.property('sortedTags.[]', 'tag'),

    selectedTagCount: function () {
        var tag = this.get('sortedTags').findBy('name', this.get('tag'));
        if (tag) {
            return tag.get('count');
        } else {
            return 0;
        }
    }.property('mostUsedTags'),

    hasMoreTags: function () {
        return this.get('sortedTags').length > this.get('tagsToDisplay');
    }.property('sortedTags.[]'),

    displayName: function () {
        return this.get('controllers.application.model.displayName');
    }.property('controllers.application.model.displayName'),

    tagChanged: function () {
        if (this.get('state') !== 'drawer-closed') {
            this.set('state', 'drawer-closed');
        }
    }.observes('tag'),

    secrets: function () {
        var tag = this.get('tag'),
            query = this.get('query'),
            content = this.get('content').sortBy('service', 'account');

        return content.filter(function (item) {
            return item.matches(tag, query);
        });
    }.property('content.isLoaded', 'tag', 'query'),

    secretsCount: function () {
        return this.get('secrets').length;
    }.property('secrets'),

    secretsNoun: function () {
        var secretsCount = this.get('secretsCount');
        return (secretsCount === 1) ? 'secret': 'secrets';
    }.property('secretsCount'),

    statusClass: function () {
        var msg = this.get('statusMessage');
        if (msg === null) {
            return 'hidden';
        } else if (msg === '') {
            return '';
        } else {
            return 'onviewport';
        }
    }.property('statusMessage'),

    syncButtonDisabled: function () {
        return this.get('isSyncing') || !this.get('isOnline');
    }.property('isSyncing', 'isOnline'),

    loginButtonDisabled: function () {
        return !this.get('isOnline');
    }.property('isOnline'),

    showMessage: function (msg) {
        this.set('statusMessage', msg);
        Ember.run.later(this, function () {
            this.set('statusMessage', '');
            Ember.run.later(this, function () {
                this.set('statusMessage', null);
            }, 500);
        }, 2500);
    },

    syncFromServer: function () {
        var controller = this,
            accessToken = null,
            clientId = null,
            serverBaseUrl = null;

        if (this.get('isSyncing') === true) {
            return;
        } else {
            this.set('isSyncing', true);

            accessToken = this.authManager.get('accessToken');
            clientId = this.authManager.get('clientId');
            serverBaseUrl = this.settings.getSetting('serverBaseUrl');

            this.syncManager.fetchSecrets(accessToken, serverBaseUrl, clientId)
                .then(function (results) {
                    var msg = [], length;
                    controller.settings.setSetting('lastSync', new Date());
                    controller.set('isSyncing', false);
                    length = results.secrets.length;
                    if (length > 0) {
                        msg.push('' + length);
                        msg.push(length > 1 ? 'secrets have': 'secret has');
                        msg.push('been succesfully updated');
                    }
                    controller.showMessage(msg.join(' '));
                });
        }
    },

    authorizeInServer: function () {
        var controller = this,
            serverBaseUrl = null;

        if (this.get('isAuthorizing') === true) {
            return;
        } else {
            this.set('isAuthorizing', true);

            serverBaseUrl = this.settings.getSetting('serverBaseUrl');
            this.authManager.authorize(serverBaseUrl)
                .then(function () {
                    controller.set('isAuthorizing', false);
                    controller.showMessage('You have succesfully logged in');
                });
        }
    },

    actions: {
        openDrawer: function () {
            this.set('state', 'drawer-opened');
        },

        closeDrawer: function () {
            this.set('state', 'drawer-closed');
        },

        clearQuery: function () {
            this.set('query', '');
        },

        login: function () {
            this.set('state', 'drawer-closed');
            Ember.run.next(this, function () {
                this.authorizeInServer();
            });
        },

        logout: function () {
            this.set('state', 'drawer-closed');
            Ember.run.next(this, function () {
                var self = this;
                this.authManager.deleteToken();
                this.settings.deleteSetting('lastAccount');
                this.syncManager.deleteAccount().then(function () {
                    self.transitionToRoute('firstTime');
                });
            });
        },

        sync: function () {
            this.set('state', 'drawer-closed');
            Ember.run.next(this, function () {
                this.syncFromServer();
            });
        },

        offline: function () {
            this.set('isOnline', false);
        },

        online: function () {
            this.set('isOnline', true);
        }

    }
});
