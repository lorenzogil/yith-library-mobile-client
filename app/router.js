import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
    this.route('firstTime', {path: '/first-time'});
    this.resource('secrets', {path: '/secrets'}, function () {
        this.resource('secret', {path: '/:secret_id'});
        this.route('tags', {path: '/tags'});
        this.route('drawer', {path: '/drawer'});
    });
});

