'use strict';


DS.IndexedDBAdapter = DS.Adapter.extend({

    // We store already normalized objects in IndexedDB
    serializer: null,

    find: function (store, type, id) {
        console.log('find');
    },

    findAll: function (store, type, sinceToken) {
        console.log('findAll');
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
