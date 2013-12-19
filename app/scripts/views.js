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

App.SecretRevealerView = Ember.View.extend({
    templateName: 'secret-revealer',
    tagName: 'form',
    classNames: ['secret-revealer'],
    buttonClass: 'recommend',
    buttonText: 'Reveal secret',
    showSecret: false,

    click: function (event) {
        var $target = $(event.target);

        if ($target.is('button')) {
            this.buttonClicked();
        }

        // Don't bubble up any more events
        return false;
    },

    buttonClicked: function () {
        var masterPasswordValue = $('#master-password').val();

        if (this.get('showSecret')) {
            this.hideSecret();
        } else {

            if (masterPasswordValue === 'secret') {
                this.revealSecret();
            } else {
                this.badMasterPassword();
            }
        }
    },

    hideSecret: function () {
        this.stopTimer();

        this.set('buttonText', 'Reveal secret');
        this.set('buttonClass', 'recommend');
        this.set('showSecret', false);
    },

    badMasterPassword: function () {
        this.set('buttonText', 'Wrong master password, try again');
        this.set('buttonClass', 'danger');
        $('#master-password').focus();
    },

    revealSecret: function () {
        this.set('buttonText', 'Hide secret');
        this.set('buttonClass', 'recommend');
        this.set('showSecret', true);

        this.startTimer();
        $('.secret-revealer button').focus();
    },

    startTimer: function () {
        this.start = new Date();

        this.totalTime = this.getTotalTime();

        this.timer = window.requestAnimationFrame(this.tick.bind(this));
    },

    stopTimer: function () {
        if (this.timer) {
            window.cancelAnimationFrame(this.timer);
        }
    },

    getTotalTime: function () {
        return 60;
    },

    tick: function () {
        var timer = document.getElementById('timer');

        if (!timer) {
            return;
        }

        var width = timer.offsetWidth,
            width2 = width / 2,
            radius = width * 0.45,
            now = new Date(),
            elapsed = (now - this.start) / 1000.0,
            completion = elapsed / this.totalTime,
            endAngle = 360 * completion,
            endPoint = this.polarToCartesian(width2, width2, radius, endAngle),
            arcSweep = endAngle <= 180 ? '1': '0',
            d = [
                'M', width2, width2 - radius,
                'A', radius, radius, 0, arcSweep, 0, endPoint.x, endPoint.y,
                'L', width2, width2,
                'Z'
            ].join(' ');

        document.getElementById('clock').setAttribute('d', d);

        // If completion is 100% hide the secret
        if (completion >= 1) {
            this.hideSecret();
        } else {
            window.requestAnimationFrame(this.tick.bind(this));
        }
    },

    polarToCartesian: function (x, y, radius, degrees) {
        var radians = (degrees - 90) * Math.PI / 180.0;
        return {
            x: x + (radius * Math.cos(radians)),
            y: y + (radius * Math.sin(radians))
        };
    }
});
