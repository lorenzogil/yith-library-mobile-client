'use strict';

App.ApplicationController = Ember.ObjectController.extend({

    // The active Account object will be set as the model for this controller

});


App.FirstTimeController = Ember.ObjectController.extend({
    needs: ['application'],
    step: 0,

    showInstructions: function () {
        return this.get('step') === 0;
    }.property('step'),

    isConnectingToServer: function () {
        return this.get('step') === 1;
    }.property('step'),

    isServerConnected: function () {
        return this.get('step') > 1;
    }.property('step'),

    isGettingAccountInformation: function () {
        return this.get('step') === 2;
    }.property('step'),

    isAccountInformationRetrieved: function () {
        return this.get('step') > 2;
    }.property('step'),

    accountDisabled: function () {
        return (this.get('step') < 2 ? 'true': 'false');
    }.property('step'),

    isGettingSecrets: function () {
        return this.get('step') === 3;
    }.property('step'),

    areSecretsRetrieved: function () {
        return this.get('step') > 3;
    }.property('step'),

    secretsDisabled: function () {
        return (this.get('step') < 3 ? 'true': 'false');
    }.property('step'),

    isFinished: function () {
        return this.get('step') === 4;
    }.property('step'),

    connectToServer: function () {
        var controller = this,
            syncManager = this.syncManager,
            authManager = this.authManager,
            clientId = this.authManager.get('clientId'),
            serverBaseUrl = this.settings.getSetting('serverBaseUrl'),
            accessToken = null;

        this.incrementProperty('step');

        this.authManager.authorize(serverBaseUrl)
            .then(function () {
                accessToken = authManager.get('accessToken');
                controller.incrementProperty('step');
                return syncManager.fetchUserInfo(
                    accessToken, serverBaseUrl, clientId
                );
            })
            .then(function (user) {
                controller.settings.setSetting('lastAccount', user.get('id'));
                controller.get('controllers.application').set('model', user);
                controller.incrementProperty('step');
                return syncManager.fetchSecrets(
                    accessToken, serverBaseUrl, clientId
                );
            })
            .then(function () {
                controller.settings.setSetting('lastSync', new Date());
                controller.incrementProperty('step');
            });
    },

    actions: {
        connect: function () {
            Ember.run.next(this, function () {
                this.connectToServer();
            });
        },

        secrets: function () {
            this.transitionToRoute('secrets.index');
        }
    }
});

App.SecretsController = Ember.ArrayController.extend({
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
