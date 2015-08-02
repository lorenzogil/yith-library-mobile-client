import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  customEvents: {
    'animationend animationEnd webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd': 'animationEnd',
    'transitionend transitionEnd webkitTransitionEnd mozTransitionEnd MSTransitionEnd oTransitionEnd': 'transitionEnd'
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
