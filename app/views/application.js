import Ember from 'ember';

export default Ember.View.extend({
    classNames: ['full-height'],

    didInsertElement: function () {
        var isMobile = /mobi/i.test(window.navigator.userAgent);
        if (isMobile && !window.location.hash && !window.pageYOffset) {
            window.setTimeout(function () {
                window.scrollTo(0, 1);
            }, 0);
        }
    }
});
