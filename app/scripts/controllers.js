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
            syncManager = null,
            oauth = null,
            accessToken = null,
            clientId = null,
            serverBaseUrl = null;

        if (this.get('syncing') === true) {
            return;
        } else {
            this.set('syncing', true);

            oauth = this.controllerFor('login').get('oauth');
            accessToken = oauth.getAccessToken();
            clientId = oauth.providerConfig.clientId;
            serverBaseUrl = this.settings.getSetting('serverBaseUrl');

            this.syncManager.fetchSecrets(accessToken, serverBaseUrl, clientId)
                .then(function () {
                    controller.settings.setSetting('lastSync', new Date());
                    controller.set('syncing', false);
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

        sync: function () {
            var controller = this;
            Ember.run.next(this, function () {
                controller.syncFromServer();
            });
        }

    }
});

App.SecretController = Ember.ObjectController.extend({
    needs: ['secrets']
});
