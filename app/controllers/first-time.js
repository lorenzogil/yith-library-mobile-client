import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: ['application'],
    step: 0,
    auth: Ember.inject.service('auth'),

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
            auth = this.get('auth'),
            clientId = auth.get('clientId'),
            serverBaseUrl = this.settings.getSetting('serverBaseUrl'),
            accessToken = null;

        this.incrementProperty('step');

        auth.authorize(serverBaseUrl)
            .then(function () {
                accessToken = auth.get('accessToken');
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
