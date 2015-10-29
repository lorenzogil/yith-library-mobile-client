import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.route('firstTime', {path: '/first-time'});
    this.route('secrets', {path: '/secrets'}, function () {
        this.route('secret', {path: '/:secret_id'});
        this.route('tags', {path: '/tags'});
        this.route('drawer', {path: '/drawer'});
    });
});

export default Router;
