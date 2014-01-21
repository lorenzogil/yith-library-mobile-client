'use strict';

App.Secret = DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string'),
    secret: DS.attr('string'),
    notes: DS.attr('notes'),
    tags: DS.attr('tags'),

    matches: function (tag, query) {
        var tagMatch = true, queryMatch = true;
        if (tag !== null) {
            tagMatch = this.get('tags').indexOf(tag) !== -1;
        }
        if (query !== '') {
            queryMatch = (
                (this.get('service').indexOf(query) !== -1) ||
                (this.get('account').indexOf(query) !== -1)
            );
        }
        return tagMatch && queryMatch;
    }
});

App.Secret.TEST_SECRET = JSON.stringify({
    iv: 'f+Ee2fY1eJYrWP71Ed6trw==',
    v: 1,
    iter: 1000,
    ks: 128,
    ts: 64,
    mode: 'ccm',
    adata: '',
    cipher: 'aes',
    salt: 'mI+1CApbcsw=',
    ct: '5bfUL8dk6DYCZ/H2CGY='
});

App.Secret.FIXTURES = [
    // master password for this fixtures is 'secret'
    {
        id: 1,
        service: 'ebay.es',
        account: 'lorenzogilsanchez',
        secret: App.Secret.TEST_SECRET,
        notes: '',
        tags: 'money'
    },
    {
        id: 2,
        service: 'iberia.com',
        account: '123456789',
        secret: App.Secret.TEST_SECRET,
        notes: 'this is a custom note',
        tags: 'travel'
    },
    {
        id: 3,
        service: 'amazon.com',
        account: 'lorenzo.gil.sanchez@examle.com',
        secret: App.Secret.TEST_SECRET,
        notes: '',
        tags: 'money'
    },
    {
        id: 4,
        service: 'dropbox.com',
        account: 'lorenzogil@example.com',
        secret: App.Secret.TEST_SECRET,
        notes: 'this password is saved in cleartext in their server',
        tags: 'work education'
    }
];


App.Tag = DS.Model.extend({
    name: DS.attr('string'),
    count: DS.attr('number')
});


App.Tag.FIXTURES = [
    {
        id: 1,
        name: 'education',
        count: 1,
    },
    {
        id: 2,
        name: 'money',
        count: 2,
    },
    {
        id: 3,
        name: 'travel',
        count: 1,
    },
    {
        id: 4,
        name: 'work',
        count: 1,
    }
];

// Open the DB and continue loading Ember
(function () {
    var request = window.indexedDB.open('yithlibrary', 1);

    request.onerror = function () {
        App.advanceReadiness();
    };

    request.onsuccess = function (event) {
        App.db = event.target.result;
        App.advanceReadiness();
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result,
            secrets = db.createObjectStore('secret', {keyPath: 'id'}),
            tags = db.createObjectStore('tag', {keyPath: 'id'});

        // Create some indexes
        secrets.createIndex('service', 'service', {unique: false});

        secrets.createIndex('account', 'account', {unique: false});

        // Add some sample data (both secrets.transaction and tags.transaction
        // are actually the same transaction)
        secrets.transaction.oncomplete = function (event) {
            var transaction = db.transaction(['secret', 'tag'], 'readwrite'),
                objectStore = transaction.objectStore('secret'),
                length = App.Secret.FIXTURES.length,
                i = 0;
            for (i = 0; i < length; i += 1) {
                objectStore.add(App.Secret.FIXTURES[i]);
            }

            objectStore = transaction.objectStore('tag');
            length = App.Tag.FIXTURES.length;
            for (i = 0; i < length; i += 1) {
                objectStore.add(App.Tag.FIXTURES[i]);
            }
        };

    };

})();
