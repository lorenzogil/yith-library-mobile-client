'use strict';

App.SecretView = Ember.View.extend({
    tagName: 'section',
    classNameBindings: ['position'],
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
            secretsController.set('position', 'left');
            this.set('position', 'current');
        });
    },

    actions: {
        secrets: function () {
            var controller = this.controller;
            var secretsController = controller.get('controllers.secrets');

            // Start the animation by setting the appropiate classes
            this.set('position', 'right');
            secretsController.set('position', 'current');

            // When the animation ends, do the transition to the index view
            var vendorPrefixes = ['webkit', 'moz', 'MS', 'o', ''];
            var prefixedEvent = vendorPrefixes.map(function (prefix) {
                var event = 'AnimationEnd';
                return (prefix ? prefix + event : event.toLowerCase());
            });
            this.$().one(prefixedEvent.join(' '), function () {
                controller.transitionToRoute('secrets');
            });
        }
    }
});
