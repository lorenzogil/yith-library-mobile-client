export default Ember.Route.extend({

    model: function () {
        return this.store.find('secret');
    },

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('state', 'drawer-closed');
        controller.set('tags', this.store.find('tag'));
    }

});
