import Ember from 'ember';
import prefixEvent from '../utils/prefix-event';

export default Ember.View.extend({
    tagName: 'section',
    classNameBindings: ['position', 'size'],
    size: 'full-height',
    position: '',
    attributeBindings: ['role', 'dataPosition:data-position'],
    role: 'region',
    dataPosition: 'right',

    didInsertElement: function () {
        var secretsController = this.controller.get('controllers.secrets');

        // Wait until the loop has finished and then start
        // the animation. Not sure why but it the animation
        // is set right away, then the view just pop up with
        // sliding from the right
        Ember.run.next(this, function () {
            secretsController.send('openSecret');
            this.set('position', 'current');
        });

        // When the animation started ad the 'secrets' action ends,
        // notify the controller so it can transition to the
        // secrets.index route
        this.$().on(prefixEvent('AnimationEnd'), function () {
            secretsController.send('secretAnimationEnd');
        });

    },

    actions: {
        secrets: function () {
            var controller = this.controller;
            var secretsController = controller.get('controllers.secrets');

            // Start the animation by setting the appropiate classes
            this.set('position', 'right');
            secretsController.send('closeSecret');
        }
    }
});
