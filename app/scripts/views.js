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
    // We need to put an Id to the toplevel view
    // so we can style it with CSS and give it
    // a height: 100%
    attributeBindings: ['id'],
    id: 'index-container'
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
    decryptedSecret: null,
    encryptedSecret: '',

    click: function (event) {
        var $target = $(event.target);

        if ($target.is('button')) {
            this.buttonClicked();
        }

        // Don't bubble up any more events
        return false;
    },

    buttonClicked: function () {
        var $masterPasswordInput = null,
            masterPasswordValue = null,
            secret = '';

        if (this.get('decryptedSecret') !== null) {
            this.hideSecret();
        } else {

            $masterPasswordInput = this.$('input[type=password]');
            masterPasswordValue = $masterPasswordInput.val();
            $masterPasswordInput.val('');
            secret = this.get('encryptedSecret');
            try {
                this.revealSecret(sjcl.decrypt(masterPasswordValue, secret));
                masterPasswordValue = null;
            } catch (err) {
                this.badMasterPassword();
            }
        }
    },

    hideSecret: function () {
        this.stopTimer();

        this.set('buttonText', 'Reveal secret');
        this.set('buttonClass', 'recommend');
        this.set('decryptedSecret', null);
    },

    badMasterPassword: function () {
        this.set('buttonText', 'Wrong master password, try again');
        this.set('buttonClass', 'danger');
        this.$('input[type=password]').focus();
    },

    revealSecret: function (secret) {
        this.set('buttonText', 'Hide secret');
        this.set('buttonClass', 'recommend');
        this.set('decryptedSecret', secret);

        Ember.run.scheduleOnce('afterRender', this, function () {
            this.$('input[type=text]').focus().select();
            this.startTimer();
        });
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
        var $timer = this.$('svg'),
            width = $timer.width(),
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

        this.$('path').attr('d', d);

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


Ember.Handlebars.helper('currentTag', function (tagName, selectedTag) {
    return (tagName === selectedTag ? '*' : '');
});
