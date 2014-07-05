import Ember from 'ember';

export default Ember.ArrayController.extend({
    needs: ['application'],
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: '',
    state: 'drawer-closed',
    tags: [],
    selectedTag: null,
    query: '',
    isSyncing: false,
    isAuthorizing: false,
    isSearching: false,
    statusMessage: null,
    isOnline: navigator.onLine,

    title: function () {
        return this.get('controllers.application.model.displayName');
    }.property('controllers.application.model.displayName'),

    secrets: function () {
        var selectedTag = this.get('selectedTag'),
            query = this.get('query'),
            content = this.get('content').sortBy('service', 'account');

        return content.filter(function (item) {
            return item.matches(selectedTag, query);
        });
    }.property('content.isLoaded', 'selectedTag', 'query'),

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
        },

        login: function () {
            Ember.run.next(this, function () {
                this.authorizeInServer();
            });
        },

        sync: function () {
            Ember.run.next(this, function () {
                this.syncFromServer();
            });
        },

        toggleSearch: function () {
            this.toggleProperty('isSearching');
            if (this.get('isSearching') === false) {
                this.set('query', '');
            }
        },

        offline: function () {
            this.set('isOnline', false);
        },

        online: function () {
            this.set('isOnline', true);
        }

    }
});
