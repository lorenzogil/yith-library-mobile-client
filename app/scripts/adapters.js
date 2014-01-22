'use strict';


DS.IndexedDBAdapter = DS.Adapter.extend({

    // We store already normalized objects in IndexedDB
    serializer: null,
    db: null,
    dbName: 'yithlibrary',
    dbVersion: 1,

    upgradeDB: function (db) {
        var secrets = db.createObjectStore('secret', {keyPath: 'id'}),
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

    },

    getDB: function () {
        var adapter = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var db = adapter.get('db'),
                dbName = adapter.get('dbName'),
                dbVersion = adapter.get('dbVersion'),
                request;
            if (db !== null) {
                resolve(db);
            } else {
                request = window.indexedDB.open(dbName, dbVersion);

                request.onerror = function (event) {
                    reject(event);
                };

                request.onsuccess = function (event) {
                    db = event.target.result;
                    adapter.set('db', db);
                    resolve(db);
                };

                request.onupgradeneeded = function (event) {
                    adapter.upgradeDB(event.target.result);
                };
            }
        });
    },

    find: function (store, type, id) {
        console.log('find');
    },

    _findAll: function (db, store, type, sinceToken) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var transaction = db.transaction([type.typeKey]),
                objectStore = transaction.objectStore(type.typeKey),
                request = objectStore.openCursor(),
                data = [];

            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    data.push(cursor.value);
                    cursor.continue();
                } else {
                    // cursor is finished
                    Ember.run(null, resolve, data);
                }
            };

            request.onerror = function (event) {
                Ember.run(null, reject, event);
            };
        });
    },

    findAll: function (store, type, sinceToken) {
        var adapter = this;
        return this.getDB().then(function (db) {
            return adapter._findAll(db, store, type, sinceToken);
        });
    },

    findQuery: function (store, type, query, recordArray) {
        console.log('findQuery');
    },

    createRecord: function (store, type, record) {
        console.log('createRecord');
    },

    updateRecord: function (store, type, record) {
        console.log('updateRecord');
    },

    deleteRecord: function (store, type, record) {
        console.log('deleteRecord');
    },

    findMany: function (store, type, ids) {
        console.log('findMany');
    }

});
