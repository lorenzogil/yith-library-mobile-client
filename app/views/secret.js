import Ember from 'ember';
import prefixEvent from '../utils/prefix-event';

export default Ember.View.extend({
    tagName: 'section',
    classNameBindings: ['position', 'size'],
    size: 'full-height',
    position: 'current',
    attributeBindings: ['role', 'dataPosition:data-position'],
    role: 'region',
    dataPosition: 'right',

    didInsertElement: function () {
        var controller = this.controller;

        // When the animation started ad the 'secrets' action ends,
        // notify the controller so it can transition to the
        // secrets.index route
        this.$().on(prefixEvent('AnimationEnd'), function () {
            controller.send('didCloseSecret');
        });

    },

    actions: {
        secrets: function () {
            this.set('position', 'right');
            this.controller.send('willCloseSecret');
        }
    }
});
