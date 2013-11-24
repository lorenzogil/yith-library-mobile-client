'use strict';

// Helper function to deal with vendor prefixes in events
App.prefixEvent = function (event) {
    var vendorPrefixes = ['webkit', 'moz', 'MS', 'o', ''];
    var prefixedEventNames = vendorPrefixes.map(function (prefix) {
        return (prefix ? prefix + event : event.toLowerCase());
    });
    return prefixedEventNames.join(' ');
};

App.SecretsView = Ember.View.extend({
    attributeBindings: ['id'],
    id: 'index-container'
});


App.SecretsListView = Ember.View.extend({
    // This view is needed in order to detect
    // the transitionEnd event of the drawer being closed
    templateName: 'secrets-list',
    tagName: 'section',
    attributeBindings: ['role', 'id'],
    role: 'region',
    id: 'secrets',
    lastState: '',
    didInsertElement: function () {
        var controller = this.get('controller');
        this.set('lastState', controller.get('state'));
        this.$().addClass(this.get('lastState'));

        this.$().on(App.prefixEvent('TransitionEnd'), function () {
            controller.send('drawerTransitionEnd');
        });
    },

    onStateChange: function () {
        this.$().removeClass(this.get('lastState'));
        this.set('lastState', this.get('controller.state'));
        this.$().addClass(this.get('lastState'));
    }.observes('controller.state'),

});

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
            secretsController.send('openSecret');
            this.set('position', 'current');
        });

        // When the animation started ad the 'secrets' action ends,
        // notify the controller so it can transition to the
        // secrets.index route
        this.$().on(App.prefixEvent('AnimationEnd'), function () {
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
