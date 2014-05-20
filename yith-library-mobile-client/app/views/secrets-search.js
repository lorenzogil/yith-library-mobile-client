import prefixEvent from '../utils/prefix-event';

export default Ember.View.extend({
    templateName: 'secrets-search',
    tagName: 'form',
    attributeBindings: ['role'],
    role: 'search',
    classNameBindings: ['active:is-active'],
    active: false,

    didInsertElement: function () {
        var self = this, $input = this.$('input');
        this.$().onn(prefixEvent('TransitionEnd'), function () {
            if (self.get('active') === true) {
                $input.focus();
            }
        });
    }
});
