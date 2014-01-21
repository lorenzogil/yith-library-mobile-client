'use strict';


DS.IndexedDBAdapter = DS.Adapter.extend({

    // We store already normalized objects in IndexedDB
    serializer: null,

    find: function (store, type, id) {
        console.log('find');
    },

    findAll: function (store, type, sinceToken) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var transaction = App.db.transaction([type.typeKey]);
            var objectStore = transaction.objectStore(type.typeKey);
            var request = objectStore.openCursor();
            var data = [];
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
