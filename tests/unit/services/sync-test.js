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

test('getUserInfo', function (assert) {
    var service = this.subject(),
        expectedData = {
            'id': 123,
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'screen_name': 'Johnny'
        };
    assert.expect(1);
    defineFixture('/user?client_id=123', {
        response: expectedData,
        jqXHR: {},
        textStatus: 'success'
    });
    service.getUserInfo('token', '', 123).then(function (data) {
        assert.deepEqual(data, expectedData);
    });
});

test('getSecrets', function (assert) {
    var service = this.subject(),
        expectedData = {
            passwords: [{
                id: 1,
                service: 'example.com',
                account: 'john',
                secret: 's3cr3t',
                notes: '',
                tags: []
            }, {
                id: 2,
                service: 'mail.example.com',
                account: 'john',
                secret: 's3cr3t',
                notes: '',
                tags: ['tag1', 'tag2']
            }]
        };
    assert.expect(1);
    defineFixture('/passwords?client_id=123', {
        response: expectedData,
        jqXHR: {},
        textStatus: 'success'
    });
    service.getSecrets('token', '', '123').then(function (data) {
        assert.deepEqual(data, expectedData);
    });
});
