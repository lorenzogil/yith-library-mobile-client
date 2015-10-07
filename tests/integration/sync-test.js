import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import startApp from '../helpers/start-app';

var app, store;

moduleFor('service:sync', 'Integration | Service | sync', {
    integration: true,
    needs: ['model:account', 'service:store'],
    beforeEach: function (assert) {
        var done = assert.async();
        app = startApp();
        store = app.__container__.lookup('service:store');
        localforage.clear(function () {
            done();
        });
    },
    afterEach: function () {
        Ember.run(app, 'destroy');
    }
});

test('updateAccountStore creates a new record and save it to the store if the record is new', function (assert) {
    var service = this.subject(),
        done = assert.async();

    assert.expect(7);

    Ember.run(function () {
        store.findAll('account').then(function (results) {
            assert.equal(results.get('length'), 0, 'The store should be empty initially');

            service.updateAccountStore({
                'id': '123',
                'email': 'test@example.com',
                'firstName': 'John',
                'lastName': 'Doe',
                'screenName': 'Johnny'
            }).then(function (record) {
                assert.equal(record.get('id'), '123', 'The id attribute should match');
                assert.equal(record.get('email'), 'test@example.com', 'The email attribute should match');
                assert.equal(record.get('firstName'), 'John', 'The firstName attribute should match');
                assert.equal(record.get('lastName'), 'Doe', 'The lastName attribute should match');
                assert.equal(record.get('screenName'), 'Johnny', 'The screenName attribute should match');

                store.findAll('account').then(function (results) {
                    assert.equal(results.get('length'), 1, 'After the call to updateAccountStore the store should contain one account');
                    done();
                });
            });
        });
    });
});
