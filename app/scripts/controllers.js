'use strict';

App.LoginController = Ember.ObjectController.extend({
    previousTransition: null,
    oauth: null,
    connecting: false,

    init: function () {
        this._super();
        var self = this,
            serverBaseUrl = this.settings.getSetting('serverBaseUrl'),
            authBaseUri = serverBaseUrl + '/oauth2/endpoints/authorization',
            oauth = null;

        Ember.OAuth2.config.yithlibrary.authBaseUri = authBaseUri;
        oauth = Ember.OAuth2.create({providerId: 'yithlibrary'});

        oauth.onSuccess = function () {
            var previousTransition = self.get('previousTransition');
            self.set('connecting', false);
            if (previousTransition) {
                self.set('previousTransition', null);
                previousTransition.retry();
            } else {
                self.transitionToRoute('secrets');
            }
        };
        this.set('oauth', oauth);
    },

    actions: {
        connect: function () {
            var oauth = this.get('oauth');
            this.set('connecting', true);
            oauth.authorize();
        }
    }
});

App.SecretsController = Ember.ArrayController.extend({
    needs: ['login'],
    sortProperties: ['service', 'account'],
    sortAscending: true,
    position: '',
    state: 'drawer-closed',
    tags: [],
    selectedTag: null,
    query: '',
    isSyncing: false,
    isAuthorizing: false,

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
                .then(function () {
                    controller.settings.setSetting('lastSync', new Date());
                    controller.set('isSyncing', false);
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
        }

    }
});

App.SecretController = Ember.ObjectController.extend({
    needs: ['secrets']
});
