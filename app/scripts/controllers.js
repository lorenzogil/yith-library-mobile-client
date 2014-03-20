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
            controller.updateStore(data).then(function () {
                controller.finishSync();
            });
        });
    },

    updateStore: function (data) {
        var self = this,
            promises = {
                secrets: this.store.find('secret'),
                tags: this.store.find('tag')
            };
        return Ember.RSVP.hash(promises).then(function (results) {
            self.updateSecrets(results.secrets, data.passwords);
            self.updateTags(results.tags, data.passwords);
        });
    },

    updateSecrets: function (existingRecords, passwords) {
        var self = this;
        passwords.forEach(function (password) {
            var existingRecord = existingRecords.findBy('id', password.id);
            if (existingRecord !== undefined) {
                self.updateSecret(existingRecord, password);
            } else {
                self.createSecret(password);
            }
        });
    },

    createSecret: function (data) {
        return this.store.createRecord('secret', {
            id: data.id,
            service: data.service,
            account: data.account,
            secret: data.secret,
            notes: data.notes,
            tags: data.tags.join(' ')
        }).save();
    },

    updateSecret: function (record, data) {
        record.set('service', data.service);
        record.set('account', data.account);
        record.set('secret', data.secret);
        record.set('notes', data.notes);
        record.set('tags', data.tags.join(' '));
        return record.save();
    },

    updateTags: function (existingRecords, passwords) {
        var self = this, newTags = new Ember.Map();
        passwords.forEach(function (password) {
            password.tags.forEach(function (tag) {
                if (newTags.has(tag)) {
                    newTags.set(tag, newTags.get(tag) + 1);
                } else {
                    newTags.set(tag, 1);
                }
            });
        });

        newTags.forEach(function (name, count) {
            var existingRecord = existingRecords.findBy('name', name);
            if (existingRecord !== undefined) {
                self.updateTag(existingRecord, name, count);
            } else {
                self.createTag(name, count);
            }
        });
    },

    createTag: function (name, count) {
        return this.store.createRecord('tag', {
            name: name,
            count: count
        }).save();
    },

    updateTag: function (record, name, count) {
        record.set('name', name);
        record.set('count', count);
        return record.save();
    },

    finishSync: function () {
        this.settings.setSetting('lastSync', new Date());
        this.set('syncing', false);
        this.transitionToRoute('secrets');
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
