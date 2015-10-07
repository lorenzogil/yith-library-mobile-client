import { moduleFor, test } from 'ember-qunit';
import { defineFixture } from 'ic-ajax';


moduleFor('service:sync', 'Unit | Service | sync', {
    needs: ['model:account']
});

test('convertRecord', function (assert) {
    var service = this.subject(),
        original = {foo_bar: 1},
        expected = {fooBar: 1},
        result = service.convertRecord(original);

    assert.deepEqual(result, expected);
});

/*
test('updateAccountStore', function (assert) {
    var service = this.subject(), result = null;
    assert.expect(1);
    Ember.run(function () {
        result = service.updateAccountStore({
            'id': 123,
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'screen_name': 'Johnny'
        });

        result.then(function (record) {
            assert.ok(record);
        });
    });
});
*/
test('fetchUserInfo empty results', function(assert) {
    var service = this.subject();
    assert.expect(1);
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
    service.fetchUserInfo('token', '', '123').then(function (data) {
        assert.deepEqual(data, {
            'id': 123,
            'email': 'test@example.com',
            'firstName': 'John',
            'lastName': 'Doe',
            'screenName': 'Johnny'
        });
    });
});
