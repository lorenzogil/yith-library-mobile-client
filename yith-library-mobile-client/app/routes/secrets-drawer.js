export default Ember.Route.extend({

    model: function () {
        return this.store.find('tag');
    },

    renderTemplate: function () {
        this.render({outlet: 'drawer'});
    }

});
