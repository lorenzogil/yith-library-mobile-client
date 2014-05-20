export default Ember.Route.extend({

    renderTemplate: function () {
        this.render({outlet: 'secret'});
    }

});
