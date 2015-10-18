import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { defineFixture } from 'ic-ajax';
import startApp from '../helpers/start-app';

moduleFor('service:sync', 'Integration | Service | sync', {
    integration: true,
    needs: ['model:account', 'model:secret', 'model:tag'],
    beforeEach: function (assert) {
        var adapter = null,
            done = assert.async();

        this.app = startApp();
        adapter = this.app.__container__.lookup('adapter:application');
        adapter.get('cache').clear();

        window.localforage.clear(function () {
            done();
        });

    },
    afterEach: function () {
        Ember.run(this.app, 'destroy');
    }
});

test('updateAccountStore creates a new record and save it to the store if the record is new', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(7);

    Ember.run(function () {
        service.get('store').findAll('account').then(function (results) {
            assert.equal(results.get('length'), 0, 'The store should be empty initially');

            return service.updateAccountStore({
                'id': '123',
                'email': 'test@example.com',
                'firstName': 'John',
                'lastName': 'Doe',
                'screenName': 'Johnny'
            });
        }).then(function (record) {
            assert.equal(record.get('id'), '123', 'The id attribute should match');
            assert.equal(record.get('email'), 'test@example.com', 'The email attribute should match');
            assert.equal(record.get('firstName'), 'John', 'The firstName attribute should match');
            assert.equal(record.get('lastName'), 'Doe', 'The lastName attribute should match');
            assert.equal(record.get('screenName'), 'Johnny', 'The screenName attribute should match');

            return service.get('store').findAll('account');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to updateAccountStore the store should contain one account');

            done();
        });
    });
});

test('updateAccountStore updates an existing record and save it to the store if the record is not new', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(7);

    Ember.run(function () {
        var account = service.get('store').createRecord('account', {
            'id': '123',
            'email': 'test@example.com',
            'firstName': 'John',
            'lastName': 'Doe',
            'screenName': 'Johnny'
        });
        account.save().then(function () {
            return service.get('store').findAll('account');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'The store should contain one account initially');
            return service.updateAccountStore({
                'id': '123',
                'email': 'test2@example.com',
                'firstName': 'John2',
                'lastName': 'Doe2',
                'screenName': 'Johnny2'
            });
        }).then(function (record) {
            assert.equal(record.get('id'), '123', 'The id attribute should match');
            assert.equal(record.get('email'), 'test2@example.com', 'The email attribute should match');
            assert.equal(record.get('firstName'), 'John2', 'The firstName attribute should match');
            assert.equal(record.get('lastName'), 'Doe2', 'The lastName attribute should match');
            assert.equal(record.get('screenName'), 'Johnny2', 'The screenName attribute should match');

            return service.get('store').findAll('account');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to updateAccountStore the store should still contain one account');
            done();
        });
    });
});

test('fetchUserInfo get user info and update the account store', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(5);

    defineFixture('/user?client_id=123', {
        response: {
            'id': '123',
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'screen_name': 'Johnny'
        },
        jqXHR: {},
        textStatus: 'success'
    });
    Ember.run(function () {
        service.fetchUserInfo('token', '', 123).then(function (record) {
            assert.equal(record.get('id'), '123', 'The id attribute should match');
            assert.equal(record.get('email'), 'test@example.com', 'The email attribute should match');
            assert.equal(record.get('firstName'), 'John', 'The firstName attribute should match');
            assert.equal(record.get('lastName'), 'Doe', 'The lastName attribute should match');
            assert.equal(record.get('screenName'), 'Johnny', 'The screenName attribute should match');

            done();
        });
    });
});

test('createSecret creates a new secret', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(8);

    Ember.run(function () {
        service.get('store').findAll('secret').then(function (results) {
            assert.equal(results.get('length'), 0, 'The store should be empty initially');

            return service.createSecret({
                id: '1',
                service: 'example.com',
                account: 'john',
                secret: 's3cr3t',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            });
        }).then(function (record) {
            assert.equal(record.get('id'), '1', 'The id attribute should match');
            assert.equal(record.get('service'), 'example.com', 'The service attribute should match');
            assert.equal(record.get('account'), 'john', 'The account attribute should match');
            assert.equal(record.get('secret'), 's3cr3t', 'The secret attribute should match');
            assert.equal(record.get('notes'), 'example notes', 'The notes attribute should match');
            assert.equal(record.get('tags'), 'tag1 tag2', 'The notes attribute should match a serialized string of the original list');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to createSecret the store should contains one secret');

            done();
        });
    });
});

test('updateSecret updates an existing secret without creating another one', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(8);

    Ember.run(function () {
        var secret = service.get('store').createRecord('secret', {
            id: '1',
            service: 'example.com',
            account: 'john',
            secret: 's3cr3t',
            notes: 'example notes',
            tags: ['tag1', 'tag2']

        });
        secret.save().then(function () {
            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'The store should contain one secret initially');

            return service.updateSecret(secret, {
                service: 'mail.example.com',
                account: 'john2',
                secret: 's3cr3t',
                notes: 'example notes2',
                tags: ['tag3', 'tag4']
            });
        }).then(function (record) {
            assert.equal(record.get('id'), '1', 'The id attribute should match');
            assert.equal(record.get('service'), 'mail.example.com', 'The service attribute should match');
            assert.equal(record.get('account'), 'john2', 'The account attribute should match');
            assert.equal(record.get('secret'), 's3cr3t', 'The secret attribute should match');
            assert.equal(record.get('notes'), 'example notes2', 'The notes attribute should match');
            assert.equal(record.get('tags'), 'tag3 tag4', 'The notes attribute should match a serialized string of the original list');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to updateSecret the store should still contains one secret');

            done();
        });
    });
});

test('updateSecrets creates secrets if they do not exists in the store', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(15);

    Ember.run(function () {
        service.get('store').findAll('secret').then(function (existingRecords) {
            assert.equal(existingRecords.get('length'), 0, 'The store should be empty initially');

            return Ember.RSVP.all(service.updateSecrets(existingRecords, [{
                id: '10',
                service: '1.example.com',
                account: 'john',
                secret: 's3cr3t1',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            }, {
                id: '11',
                service: '2.example.com',
                account: 'john',
                secret: 's3cr3t2',
                notes: '',
                tags: []
            }]));
        }).then(function (newRecords) {
            assert.equal(newRecords.length, 2, "After the promises are resolved the result contain 2 new records");

            assert.equal(newRecords[0].get('id'), '10', 'The id attribute of the first record should match');
            assert.equal(newRecords[0].get('service'), '1.example.com', 'The service attribute of the first record should match');
            assert.equal(newRecords[0].get('account'), 'john', 'The account attribute of the first record should match');
            assert.equal(newRecords[0].get('secret'), 's3cr3t1', 'The secret attribute of the first record should match');
            assert.equal(newRecords[0].get('notes'), 'example notes', 'The notes attribute of the first record should match');
            assert.equal(newRecords[0].get('tags'), 'tag1 tag2', 'The tags attribute of the first record should match');

            assert.equal(newRecords[1].get('id'), '11', 'The id attribute of the second record should match');
            assert.equal(newRecords[1].get('service'), '2.example.com', 'The service attribute of the second record should match');
            assert.equal(newRecords[1].get('account'), 'john', 'The account attribute of the second record should match');
            assert.equal(newRecords[1].get('secret'), 's3cr3t2', 'The secret attribute of the second record should match');
            assert.equal(newRecords[1].get('notes'), '', 'The notes attribute of the second record should match');
            assert.equal(newRecords[1].get('tags'), '', 'The tags attribute of the second record should match');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecrets the store should contains two secrets');

            done();
        });
    });
});

test('updateSecrets updates secrets if they already exists in the store', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(15);

    Ember.run(function () {
        var secret = service.get('store').createRecord('secret', {
            id: '10',
            service: 'example.com',
            account: 'johnny',
            secret: '0lds3cr3t',
            notes: 'old example notes',
            tags: ['old-tag1', 'old-tag2']
        });
        secret.save().then(function () {
            return service.get('store').findAll('secret');
        }).then(function (existingRecords) {
            assert.equal(existingRecords.get('length'), 1, 'The store should contain one secret initially');

            return Ember.RSVP.all(service.updateSecrets(existingRecords, [{
                id: '10',
                service: '1.example.com',
                account: 'john',
                secret: 's3cr3t1',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            }, {
                id: '11',
                service: '2.example.com',
                account: 'john',
                secret: 's3cr3t2',
                notes: '',
                tags: []
            }]));
        }).then(function (newRecords) {
            assert.equal(newRecords.length, 2, "After the promises are resolved the result contain 2 records, one updated, one new");

            assert.equal(newRecords[0].get('id'), '10', 'The id attribute of the first record should match');
            assert.equal(newRecords[0].get('service'), '1.example.com', 'The service attribute of the first record should match');
            assert.equal(newRecords[0].get('account'), 'john', 'The account attribute of the first record should match');
            assert.equal(newRecords[0].get('secret'), 's3cr3t1', 'The secret attribute of the first record should match');
            assert.equal(newRecords[0].get('notes'), 'example notes', 'The notes attribute of the first record should match');
            assert.equal(newRecords[0].get('tags'), 'tag1 tag2', 'The tags attribute of the first record should match');

            assert.equal(newRecords[1].get('id'), '11', 'The id attribute of the second record should match');
            assert.equal(newRecords[1].get('service'), '2.example.com', 'The service attribute of the second record should match');
            assert.equal(newRecords[1].get('account'), 'john', 'The account attribute of the second record should match');
            assert.equal(newRecords[1].get('secret'), 's3cr3t2', 'The secret attribute of the second record should match');
            assert.equal(newRecords[1].get('notes'), '', 'The notes attribute of the second record should match');
            assert.equal(newRecords[1].get('tags'), '', 'The tags attribute of the second record should match');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecrets the store should contains two secrets');

            done();
        });
    });
});


test('createTag creates a new tag', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(4);

    Ember.run(function () {
        service.get('store').findAll('tag').then(function (results) {
            assert.equal(results.get('length'), 0, 'The store should be empty initially');

            return service.createTag({
                name: 'tag1',
                count: 10
            });
        }).then(function (record) {
            assert.equal(record.get('name'), 'tag1', 'The name attribute should match');
            assert.equal(record.get('count'), 10, 'The count attribute should match');

            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to createTag the store should contains one tag');

            done();
        });
    });
});

test('updateTag updates an existing tag without creating another one', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(4);

    Ember.run(function () {
        var tag = service.get('store').createRecord('tag', {
            name: 'tag1',
            count: 10
        });
        tag.save().then(function () {
            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'The store should contain one tag initially');

            return service.updateTag(tag, {name: 'tag1', count: 20});
        }).then(function (record) {
            assert.equal(record.get('name'), 'tag1', 'The name attribute should match');
            assert.equal(record.get('count'), 20, 'The count attribute should match');

            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to updateTag the store should still contains one tag');

            done();
        });
    });
});

test('updateTags creates tags if they do not exists in the store', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(7);

    Ember.run(function () {
        service.get('store').findAll('tag').then(function (existingRecords) {
            assert.equal(existingRecords.get('length'), 0, 'The store should be empty initially');

            return Ember.RSVP.all(service.updateTags(existingRecords, [{
                id: '10',
                service: '1.example.com',
                account: 'john',
                secret: 's3cr3t1',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            }, {
                id: '11',
                service: '2.example.com',
                account: 'john',
                secret: 's3cr3t2',
                notes: '',
                tags: ['tag1']
            }]));
        }).then(function (newRecords) {
            assert.equal(newRecords.length, 2, "After the promises are resolved the result contain 2 new records");

            assert.equal(newRecords[0].get('name'), 'tag1', 'The name attribute of the first record should match');
            assert.equal(newRecords[0].get('count'), 2, 'The count attribute of the first record should match');

            assert.equal(newRecords[1].get('name'), 'tag2', 'The name attribute of the second record should match');
            assert.equal(newRecords[1].get('count'), 1, 'The count attribute of the second record should match');
            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecrets the store should contains two tags');

            done();
        });
    });
});

test('updateTags updates tags if they exist in the store', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(7);

    Ember.run(function () {
        var tag = service.get('store').createRecord('tag', {
            name: 'tag1',
            count: 10
        });
        tag.save().then(function () {
            return service.get('store').findAll('tag');
        }).then(function (existingRecords) {
            assert.equal(existingRecords.get('length'), 1, 'The store should contain one tag initially');

            return Ember.RSVP.all(service.updateTags(existingRecords, [{
                id: '10',
                service: '1.example.com',
                account: 'john',
                secret: 's3cr3t1',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            }, {
                id: '11',
                service: '2.example.com',
                account: 'john',
                secret: 's3cr3t2',
                notes: '',
                tags: ['tag1']
            }]));
        }).then(function (newRecords) {
            assert.equal(newRecords.length, 2, "After the promises are resolved the result contain 2 new records");

            assert.equal(newRecords[0].get('name'), 'tag1', 'The name attribute of the first record should match');
            assert.equal(newRecords[0].get('count'), 2, 'The count attribute of the first record should match');

            assert.equal(newRecords[1].get('name'), 'tag2', 'The name attribute of the second record should match');
            assert.equal(newRecords[1].get('count'), 1, 'The count attribute of the second record should match');
            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecrets the store should contains two tags');

            done();
        });
    });
});

test('updateSecretsStore updates the secrets store with incoming data from the server', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(22);

    Ember.run(function () {

        service.get('store').findAll('tag').then(function (results) {
            assert.equal(results.get('length'), 0, 'The tag store should be empty initially');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 0, 'The secret store should be empty initially');

            return service.updateSecretsStore({
                passwords: [{
                    id: '1',
                    service: '1.example.com',
                    account: 'john',
                    secret: 's3cr3t1',
                    notes: 'example notes',
                    tags: ['tag1', 'tag2']
                }, {
                    id: '2',
                    service: '2.example.com',
                    account: 'john',
                    secret: 's3cr3t2',
                    notes: '',
                    tags: ['tag1']
                }]
            });
        }).then(function (result) {
            assert.equal(result.secrets.length, 2, 'There should be two secrets in the results');
            assert.equal(result.secrets[0].get('id'), '1', 'The id attribute of the first secret should match');
            assert.equal(result.secrets[0].get('service'), '1.example.com', 'The service attribute of the first secret should match');
            assert.equal(result.secrets[0].get('account'), 'john', 'The account attribute of the first secret should match');
            assert.equal(result.secrets[0].get('secret'), 's3cr3t1', 'The secret attribute of the first secret should match');
            assert.equal(result.secrets[0].get('notes'), 'example notes', 'The notes attribute of the first secret should match');
            assert.equal(result.secrets[0].get('tags'), 'tag1 tag2', 'The tags attribute of the first secret should match');

            assert.equal(result.secrets[1].get('id'), '2', 'The id attribute of the second secret should match');
            assert.equal(result.secrets[1].get('service'), '2.example.com', 'The service attribute of the second secret should match');
            assert.equal(result.secrets[1].get('account'), 'john', 'The account attribute of the second secret should match');
            assert.equal(result.secrets[1].get('secret'), 's3cr3t2', 'The secret attribute of the second secret should match');
            assert.equal(result.secrets[1].get('notes'), '', 'The notes attribute of the second secret should match');
            assert.equal(result.secrets[1].get('tags'), 'tag1', 'The tags attribute of the second secret should match');

            assert.equal(result.tags.length, 2, 'There should be two tags in the results');
            assert.equal(result.tags[0].get('name'), 'tag1', 'The name attribute of the first tag should match');
            assert.equal(result.tags[0].get('count'), 2, 'The count attribute of the first tag should match');

            assert.equal(result.tags[1].get('name'), 'tag2', 'The name attribute of the second tag should match');
            assert.equal(result.tags[1].get('count'), 1, 'The count attribute of the second tag should match');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecretsStore the store should contain two secrets');

            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecretsStore the store should contain two tags');
            done();
        });
    });

});

test('fetchSecrets get the secrets and update the account store', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(22);

    defineFixture('/passwords?client_id=123', {
        response: {
            passwords: [{
                id: '1',
                service: '1.example.com',
                account: 'john',
                secret: 's3cr3t1',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            }, {
                id: '2',
                service: '2.example.com',
                account: 'john',
                secret: 's3cr3t2',
                notes: '',
                tags: ['tag1']
            }]
        },
        jqXHR: {},
        textStatus: 'success'
    });
    Ember.run(function () {
        service.get('store').findAll('tag').then(function (results) {
            assert.equal(results.get('length'), 0, 'The tag store should be empty initially');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 0, 'The secret store should be empty initially');

            return service.fetchSecrets('token', '', 123);
        }).then(function (result) {
            assert.equal(result.secrets.length, 2, 'There should be two secrets in the results');
            assert.equal(result.secrets[0].get('id'), '1', 'The id attribute of the first secret should match');
            assert.equal(result.secrets[0].get('service'), '1.example.com', 'The service attribute of the first secret should match');
            assert.equal(result.secrets[0].get('account'), 'john', 'The account attribute of the first secret should match');
            assert.equal(result.secrets[0].get('secret'), 's3cr3t1', 'The secret attribute of the first secret should match');
            assert.equal(result.secrets[0].get('notes'), 'example notes', 'The notes attribute of the first secret should match');
            assert.equal(result.secrets[0].get('tags'), 'tag1 tag2', 'The tags attribute of the first secret should match');

            assert.equal(result.secrets[1].get('id'), '2', 'The id attribute of the second secret should match');
            assert.equal(result.secrets[1].get('service'), '2.example.com', 'The service attribute of the second secret should match');
            assert.equal(result.secrets[1].get('account'), 'john', 'The account attribute of the second secret should match');
            assert.equal(result.secrets[1].get('secret'), 's3cr3t2', 'The secret attribute of the second secret should match');
            assert.equal(result.secrets[1].get('notes'), '', 'The notes attribute of the second secret should match');
            assert.equal(result.secrets[1].get('tags'), 'tag1', 'The tags attribute of the second secret should match');

            assert.equal(result.tags.length, 2, 'There should be two tags in the results');
            assert.equal(result.tags[0].get('name'), 'tag1', 'The name attribute of the first tag should match');
            assert.equal(result.tags[0].get('count'), 2, 'The count attribute of the first tag should match');

            assert.equal(result.tags[1].get('name'), 'tag2', 'The name attribute of the second tag should match');
            assert.equal(result.tags[1].get('count'), 1, 'The count attribute of the second tag should match');

            return service.get('store').findAll('secret');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecretsStore the store should contain two secrets');

            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 2, 'After the call to updateSecretsStore the store should contain two tags');
            done();
        });
    });
});
