'use strict';

App.AuthManager = Ember.Object.extend({

    clientId: 'd866fbc8-a367-44a2-9d6f-8ae2ffbd2748',
    clientBaseUrl: 'http://10.0.0.9:9000',
    scope: 'read-passwords read-userinfo',
    accessToken: null,
    accessTokenExpiration: null,

    init: function () {
        this._super();
        this.loadToken();
    },

    redirectUri: function () {
        return this.get('clientBaseUrl') + '/auth-callback.html';
    }.property('clientBaseUrl'),

    authUri: function () {
        return [
            this.get('authBaseUri'),
            '?response_type=token',
            '&redirect_uri=' + encodeURIComponent(this.get('redirectUri')),
            '&client_id=' + encodeURIComponent(this.get('clientId')),
            '&scope=' + encodeURIComponent(this.get('scope')),
        ].join('');
    }.property('authBaseUri', 'providerId', 'clientId', 'scope'),

    hasValidAccessToken: function () {
        var accessToken = this.get('accessToken'),
            expiration = this.get('accessTokenExpiration');
        return accessToken !== null && this.now() < expiration;
    }.property('accessToken', 'accessTokenExpiration'),

    authorize: function (serverBaseUrl) {
        var self = this,
            state = this.uuid(),
            encodedState = encodeURIComponent(state),
            authUri = this.get('authUri') + '&state=' + encodedState,
            uri = serverBaseUrl + '/oauth2/endpoints/authorization' + authUri,
            dialog = window.open(uri, 'Authorize', 'height=600, width=450'),
            clientBaseUrl = this.get('clientBaseUrl');

        if (window.focus) {
            dialog.focus();
        }

        return new Ember.RSVP.Promise(function (resolve, reject) {
            $(window).on('message', function (event) {
                var params;
                if (event.originalEvent.origin === clientBaseUrl) {
                    dialog.close();
                    params = self.parseHash(event.originalEvent.data);
                    if (self.checkResponse(params, state)) {
                        self.saveToken(params);
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
    },

    parseHash: function (hash) {
        var params = {},
            queryString = hash.substring(1),  // remove #
            regex =  /([^#?&=]+)=([^&]*)/g,
            match = null,
            key = null;

        while ((match = regex.exec(queryString)) !== null) {
            key = App.snakeCaseToCamelCase(decodeURIComponent(match[1]));
            params[key] = decodeURIComponent(match[2]);
        }
        return params;
    },

    checkResponse: function (params, state) {
        return params.accessToken && params.state === state;
    },

    saveToken: function (token) {
        var expiration = this.now() + parseInt(token.expiresIn, 10);
        this.set('accessToken', token.accessToken);
        this.set('accessTokenExpiration', expiration);
        window.localStorage.setItem('accessToken', token.accessToken);
        window.localStorage.setItem('accessTokenExpiration', expiration);
    },

    loadToken: function () {
        var accessToken = window.localStorage.getItem('accessToken'),
            expiration = window.localStorage.getItem('accessTokenExpiration');
        this.set('accessToken', accessToken);
        this.set('accessTokenExpiration', expiration);
    },

    now: function () {
        return Math.round(new Date().getTime() / 1000.0);
    },

    uuid: function () {
        var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        return template.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = (c === 'x' ? r : (r & 0x3 | 0x8));
            return v.toString(16);
        });
    }
});


Ember.Application.initializer({
    name: 'authManager',

    initialize: function (container, application) {
        application.register('authmanager:main', application.AuthManager);
    }
});


Ember.Application.initializer({
    name: 'injectAuthManager',
    before: 'authManager',

    initialize: function (container, application) {
        application.inject('controller', 'authManager', 'authmanager:main');
    }
});
