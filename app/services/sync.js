import Ember from 'ember';
import request from 'ic-ajax';
import snakeCaseToCamelCase from '../utils/snake-case-to-camel-case';

export default Ember.Service.extend({

    store: Ember.inject.service(),

    fetchUserInfo: function (accessToken, serverBaseUrl, clientId) {
        var self = this;

        return self.getUserInfo(accessToken, serverBaseUrl, clientId).then(function (rawData) {
            return self.convertRecord(rawData);
        }).then(function (convertedData) {
            return self.updateAccountStore(convertedData);
        });
    },

    getUserInfo: function (accessToken, serverBaseUrl, clientId) {
        return request({
            url: serverBaseUrl + '/user?client_id=' + clientId,
            type: 'GET',
            crossDomain: true,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    },

    /* Convert all the keys of the record to be in camelCase
       instead of snake_case */
    convertRecord: function (record) {
        var newRecord = {}, key = null, newKey = null;
        for (key in record) {
            if (record.hasOwnProperty(key)) {
                newKey = snakeCaseToCamelCase(key);
                newRecord[newKey] = record[key];
            }
        }
        return newRecord;
    },

    updateAccountStore: function (data) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve /*, reject */) {
            var store = self.get('store');
            store.findRecord('account', data.id).then(
                function (existingRecord) {
                    // update account
		            existingRecord.set('email', data.email);
		            existingRecord.set('firstName', data.firstName);
		            existingRecord.set('lastName', data.lastName);
		            existingRecord.set('screenName', data.screenName);
                    existingRecord.save().then(function (record) {
                        resolve(record);
                    });
                },
                function () {
                    // create account
                    // because we try to find it, it is already in the store
                    // but the record is empty.
                    var newRecord = store.recordForId('account', data.id);
                    store.unloadRecord(newRecord);
                    newRecord = store.createRecord('account', data);
                    newRecord.save().then(function (record) {
                        resolve(record);
                    });
                }
            );
        });
    },

    fetchSecrets: function (accessToken, serverBaseUrl, clientId) {
        var self = this;

        self.getSecrets(accessToken, serverBaseUrl, clientId).then(function (rawData) {
            return self.updateSecretsStore(rawData);
        });
    },

    getSecrets: function (accessToken, serverBaseUrl, clientId) {
        return request({
            url: serverBaseUrl + '/passwords?client_id=' + clientId,
            type: 'GET',
            crossDomain: true,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    },

    updateSecretsStore: function (data) {
        var self = this,
            store = this.get('store'),
            promises = {
                secrets: store.findAll('secret'),
                tags: store.findAll('tag')
            };
        return Ember.RSVP.hash(promises).then(function (results) {
            var secretsPromise = Ember.RSVP.all(self.updateSecrets(
                results.secrets,
                data.passwords
            )), tagsPromise = Ember.RSVP.all(self.updateTags(
                results.tags,
                data.passwords
            ));
            return Ember.RSVP.hash({
                secrets: secretsPromise,
                tags: tagsPromise
            });
        });
    },

    updateSecrets: function (existingRecords, secrets) {
        var self = this, result = [];
        secrets.forEach(function (secret) {
            var existingRecord = existingRecords.findBy('id', secret.id);
            if (existingRecord !== undefined) {
                result.push(self.updateSecret(existingRecord, secret));
            } else {
                result.push(self.createSecret(secret));
            }
        });
        return result;
    },

    createSecret: function (data) {
        return this.get('store').createRecord('secret', {
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
        var self = this, newTags = new Ember.Map(), result = [];
        passwords.forEach(function (password) {
            password.tags.forEach(function (tag) {
                if (newTags.has(tag)) {
                    newTags.set(tag, newTags.get(tag) + 1);
                } else {
                    newTags.set(tag, 1);
                }
            });
        });

        newTags.forEach(function (count, name) {
            var existingRecord = existingRecords.findBy('name', name),
                data = {name: name, count: count};
            if (existingRecord !== undefined) {
                result.push(self.updateTag(existingRecord, data));
            } else {
                result.push(self.createTag(data));
            }
        });

        // TODO: remove tags that do not exist anymore

        return result;
    },

    createTag: function (data) {
        return this.get('store').createRecord('tag', {
            name: data.name,
            count: data.count
        }).save();
    },

    updateTag: function (record, data) {
        record.set('name', data.name);
        record.set('count', data.count);
        return record.save();
    },

    deleteAccount: function () {
        var promises = [], store = this.get('store');
        store.all('secret').forEach(function (secret) {
            promises.push(secret.destroyRecord());
        }, this);
        store.all('tag').forEach(function (tag) {
            promises.push(tag.destroyRecord());
        }, this);
        store.all('account').forEach(function (account) {
            promises.push(account.destroyRecord());
        }, this);

        return Ember.RSVP.all(promises);
    }

});
