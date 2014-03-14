'use strict';

App.ApplicationController = Ember.Controller.extend({

    init: function () {
        var serverBaseUrl = this.settings.getSetting('serverBaseUrl'),
            authBaseUri = serverBaseUrl + '/oauth2/endpoints/authorization';

        Ember.OAuth2.config.yithlibrary.authBaseUri = authBaseUri;
    }

});


App.LoginController = Ember.ObjectController.extend({
    oauth: null,
    connecting: false,

    init: function () {
        this._super();
        var self = this,
            oauth = Ember.OAuth2.create({providerId: 'yithlibrary'});

        oauth.onSuccess = function () {
            self.set('connecting', false);
            self.transitionToRoute('sync');
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

App.SyncController = Ember.ObjectController.extend({
    needs: 'login',
    syncing: false,

    fetchSecrets: function () {
        var controller = this,
            serverBaseUrl = this.settings.getSetting('serverBaseUrl'),
            oauth = this.controllerFor('login').get('oauth'),
            accessToken = oauth.getAccessToken(),
            clientId = oauth.providerConfig.clientId,
            url = serverBaseUrl + '/passwords?client_id=' + clientId;

        $.ajax({
            url: url,
            type: 'GET',
            crossDomain: true,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).done(function (data /*, textStatus, jqXHR*/) {
            controller.storeSecrets(data);
        });
    },

    storeSecrets: function (secrets) {
        this.set('syncing', false);
        console.log(secrets);
    },

    actions: {
        sync: function () {
            var controller = this;
            this.set('syncing', true);

            Ember.run.next(this, function () {
                controller.fetchSecrets();
            });
        }
    }
});

App.SecretsController = Ember.ArrayController.extend({
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
