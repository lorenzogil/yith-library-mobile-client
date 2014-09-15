import Ember from 'ember';

var Router = Ember.Router.extend({
  location: YithLibraryMobileClientENV.locationType
});

Router.map(function() {
    this.route('firstTime', {path: '/first-time'});
    this.resource('secrets', {path: '/secrets'}, function () {
        this.resource('secret', {path: '/:secret_id'});
        this.route('tags', {path: '/tags'});
        this.route('drawer', {path: '/drawer'});
    });
});

export default Router;
