var Router = Ember.Router.extend({
  location: ENV.locationType
});

Router.map(function() {
    this.route('firstTime', {path: '/first-time'});
    this.resource('secrets', {
        path: '/secrets',
        queryParams: ['tag']
    }, function () {
        this.resource('secret', {path: '/:secret_id'});
    });
});

export default Router;
