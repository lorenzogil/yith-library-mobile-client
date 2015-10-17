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
                'id': 123,
                'email': 'test@example.com',
                'firstName': 'John',
                'lastName': 'Doe',
                'screenName': 'Johnny'
            });
        }).then(function (record) {
            assert.equal(record.get('id'), 123, 'The id attribute should match');
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
            'id': 123,
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
                'id': 123,
                'email': 'test2@example.com',
                'firstName': 'John2',
                'lastName': 'Doe2',
                'screenName': 'Johnny2'
            });
        }).then(function (record) {
            assert.equal(record.get('id'), 123, 'The id attribute should match');
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
            'id': 123,
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
            assert.equal(record.get('id'), 123, 'The id attribute should match');
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
                id: 1,
                service: 'example.com',
                account: 'john',
                secret: 's3cr3t',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            });
        }).then(function (record) {
            assert.equal(record.get('id'), 1, 'The id attribute should match');
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
            id: 1,
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
            assert.equal(record.get('id'), 1, 'The id attribute should match');
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

test('updateSecrets create or update a set of passwords', function (assert) {
    var service = this.subject(),
        done = assert.async();

    Ember.run(function () {
        service.get('store').findAll('secret').then(function (existingRecords) {
            assert.equal(existingRecords.get('length'), 0, 'The store should be empty initially');

            return Ember.RSVP.all(service.updateSecrets(existingRecords, [{
                id: 10,
                service: '1.example.com',
                account: 'john',
                secret: 's3cr3t1',
                notes: 'example notes',
                tags: ['tag1', 'tag2']
            }, {
                id: 11,
                service: '2.example.com',
                account: 'john',
                secret: 's3cr3t2',
                notes: '',
                tags: []
            }]));
        }).then(function (newRecords) {
            assert.equal(newRecords.length, 2, "After the promises are resolved the result contain 2 new records");

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

    assert.expect(5);

    Ember.run(function () {
        service.get('store').findAll('tag').then(function (results) {
            assert.equal(results.get('length'), 0, 'The store should be empty initially');

            return service.createTag({
                id: 1,
                name: 'tag1',
                count: 10
            });
        }).then(function (record) {
            assert.equal(record.get('id'), 1, 'The id attribute should match');
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

    assert.expect(5);

    Ember.run(function () {
        var tag = service.get('store').createRecord('tag', {
            id: 1,
            name: 'tag1',
            count: 10
        });
        tag.save().then(function () {
            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'The store should contain one tag initially');

            return service.updateTag(tag, {name: 'tag1', count: 20});
        }).then(function (record) {
            assert.equal(record.get('id'), 1, 'The id attribute should match');
            assert.equal(record.get('name'), 'tag1', 'The name attribute should match');
            assert.equal(record.get('count'), 20, 'The count attribute should match');

            return service.get('store').findAll('tag');
        }).then(function (results) {
            assert.equal(results.get('length'), 1, 'After the call to updateTag the store should still contains one tag');

            done();
        });
    });
});

