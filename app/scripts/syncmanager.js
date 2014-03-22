'use strict';

App.SyncManager = Ember.Object.extend({

    fetchSecrets: function (accessToken, serverBaseUrl, clientId) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve /*, reject */) {
            $.ajax({
                url: serverBaseUrl + '/passwords?client_id=' + clientId,
                type: 'GET',
                crossDomain: true,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            }).done(function (data /*, textStatus, jqXHR*/) {
                resolve(data);
            });
        }).then(function (data) {
            return self.updateStore(data);
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
    }

});

Ember.Application.initializer({
    name: 'syncManager',

    initialize: function (container, application) {
        application.register('syncmanager:main', application.SyncManager);
    }
});

Ember.Application.initializer({
    name: 'injectSyncManager',
    before: 'syncManager',

    initialize: function (container, application) {
        application.inject('controller', 'syncManager', 'syncmanager:main');
        application.inject('syncmanager', 'store', 'store:main');
    }
});
