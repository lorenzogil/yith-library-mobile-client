import Ember from 'ember';
import snakeCaseToCamelCase from '../utils/snake-case-to-camel-case';

export default Ember.Object.extend({

    fetchUserInfo: function (accessToken, serverBaseUrl, clientId) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve /*, reject */) {
            $.ajax({
                url: serverBaseUrl + '/user?client_id=' + clientId,
                type: 'GET',
                crossDomain: true,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            }).done(function (data /*, textStatus, jqXHR*/) {
                resolve(data);
            });
        }).then(function (data) {
            return self.updateAccountStore(data);
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
        data = this.convertRecord(data);
        return this.store.createRecord('account', {
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            screenName: data.screenName
        }).save();
    },

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
            return self.updateSecretsStore(data);
        });
    },

    updateSecretsStore: function (data) {
        var self = this,
            promises = {
                secrets: this.store.find('secret'),
                tags: this.store.find('tag')
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

    updateSecrets: function (existingRecords, passwords) {
        var self = this, result = [];
        passwords.forEach(function (password) {
            var existingRecord = existingRecords.findBy('id', password.id);
            if (existingRecord !== undefined) {
                result.push(self.updateSecret(existingRecord, password));
            } else {
                result.push(self.createSecret(password));
            }
        });
        return result;
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

        newTags.forEach(function (name, count) {
            var existingRecord = existingRecords.findBy('name', name);
            if (existingRecord !== undefined) {
                result.push(self.updateTag(existingRecord, name, count));
            } else {
                result.push(self.createTag(name, count));
            }
        });
        return result;
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
