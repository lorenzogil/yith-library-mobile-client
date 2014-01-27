'use strict';


DS.IndexedDBAdapter = DS.Adapter.extend({

    // We store already normalized objects in IndexedDB
    serializer: null,
    db: null,
    dbName: '',    // this should be defined when the adapter is created
    dbVersion: 1,  // this should be defined when the adapter is created
    models: [],    // object stores will be created for these models

    upgradeDB: function (db) {
        var models = this.get('models'),
            store = this.container.lookup('store:main'),
            model = null,
            objectStore = null,
            i = 0,
            j = 0;

        if (models.length === 0) {
            return;
        }

        // Create object stores and indexes
        for (i = 0; i < models.length; i += 1) {
            objectStore = db.createObjectStore(
                models[i], {keyPath: 'id'}
            );
            model = store.modelFor(models[i]);
            if (model.INDEXES) {
                for (j = 0; j < model.INDEXES.length; j += 1) {
                    objectStore.createIndex(
                        model.INDEXES[j].name,
                        model.INDEXES[j].name,
                        model.INDEXES[j].options
                    );
                }
            }
        }

        // Add some sample data
        objectStore.transaction.oncomplete = function () {
            var transaction = db.transaction(models, 'readwrite');
            for (i = 0; i < models.length; i += 1) {
                model = store.modelFor(models[i]);
                if (model.FIXTURES) {
                    objectStore = transaction.objectStore(models[i]);
                    for (j = 0; j < model.FIXTURES.length; j += 1) {
                        objectStore.add(model.FIXTURES[j]);
                    }
                }
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
                    // after upgrading the DB, the
                    // request.onsuccess callback is called
                };
            }
        });
    },

    find: function (/*store, type, id*/) {
        console.log('find');
    },

    _findAll: function (db, store, type/*, sinceToken*/) {
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

    findQuery: function (/*store, type, query, recordArray*/) {
        console.log('findQuery');
    },

    createRecord: function (/*store, type, record*/) {
        console.log('createRecord');
    },

    updateRecord: function (/*store, type, record*/) {
        console.log('updateRecord');
    },

    deleteRecord: function (/*store, type, record*/) {
        console.log('deleteRecord');
    },

    findMany: function (/*store, type, ids*/) {
        console.log('findMany');
    }

});
