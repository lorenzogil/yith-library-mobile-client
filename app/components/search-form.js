import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'form',
    attributeBindings: ['action'],
    action: '#',

    didInsertElement: function () {
        this.$('input').focus();
    },

    actions: {

        clearQuery: function () {
            this.set('query', '');
        }

    }
});
