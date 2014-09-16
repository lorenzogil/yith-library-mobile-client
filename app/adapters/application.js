import DS from "ember-data";

export default DS.IndexedDBAdapter.extend({
    databaseName: 'yithlibrary',
    version: 1,
    migrations: function () {
        this.addModel('account', {keyPath: 'id', autoIncrement: false});
        this.addModel('secret', {keyPath: 'id', autoIncrement: false});
        this.addModel('tag');
    }
});
