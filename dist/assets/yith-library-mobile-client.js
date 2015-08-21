"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('yith-library-mobile-client/acceptance-tests/main', ['exports', 'ember-cli-sri/acceptance-tests/main'], function (exports, main) {

	'use strict';



	exports['default'] = main['default'];

});
define('yith-library-mobile-client/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].IndexedDBAdapter.extend({
        databaseName: 'yithlibrary',
        version: 1,
        migrations: function migrations() {
            this.addModel('account', { keyPath: 'id', autoIncrement: false });
            this.addModel('secret', { keyPath: 'id', autoIncrement: false });
            this.addModel('tag');
        }
    });

});
define('yith-library-mobile-client/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'yith-library-mobile-client/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModeulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default'],
    customEvents: {
      'animationend animationEnd webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd': 'animationEnd',
      'transitionend transitionEnd webkitTransitionEnd mozTransitionEnd MSTransitionEnd oTransitionEnd': 'transitionEnd'
    }
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('yith-library-mobile-client/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'yith-library-mobile-client/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
define('yith-library-mobile-client/controllers/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({

        // The active Account object will be set as the model for this controller

    });

});
define('yith-library-mobile-client/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('yith-library-mobile-client/controllers/first-time', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        application: Ember['default'].inject.controller(),
        step: 0,
        auth: Ember['default'].inject.service(),
        settings: Ember['default'].inject.service(),
        sync: Ember['default'].inject.service(),

        showInstructions: (function () {
            return this.get('step') === 0;
        }).property('step'),

        isConnectingToServer: (function () {
            return this.get('step') === 1;
        }).property('step'),

        isServerConnected: (function () {
            return this.get('step') > 1;
        }).property('step'),

        isGettingAccountInformation: (function () {
            return this.get('step') === 2;
        }).property('step'),

        isAccountInformationRetrieved: (function () {
            return this.get('step') > 2;
        }).property('step'),

        accountDisabled: (function () {
            return this.get('step') < 2 ? 'true' : 'false';
        }).property('step'),

        isGettingSecrets: (function () {
            return this.get('step') === 3;
        }).property('step'),

        areSecretsRetrieved: (function () {
            return this.get('step') > 3;
        }).property('step'),

        secretsDisabled: (function () {
            return this.get('step') < 3 ? 'true' : 'false';
        }).property('step'),

        isFinished: (function () {
            return this.get('step') === 4;
        }).property('step'),

        connectToServer: function connectToServer() {
            var controller = this,
                sync = this.get('sync'),
                auth = this.get('auth'),
                clientId = auth.get('clientId'),
                settings = this.get('settings'),
                serverBaseUrl = settings.getSetting('serverBaseUrl'),
                accessToken = null;

            this.incrementProperty('step');

            auth.authorize(serverBaseUrl).then(function () {
                accessToken = auth.get('accessToken');
                controller.incrementProperty('step');
                return sync.fetchUserInfo(accessToken, serverBaseUrl, clientId);
            }).then(function (user) {
                settings.setSetting('lastAccount', user.get('id'));
                controller.get('controllers.application').set('model', user);
                controller.incrementProperty('step');
                return sync.fetchSecrets(accessToken, serverBaseUrl, clientId);
            }).then(function () {
                settings.setSetting('lastSync', new Date());
                controller.incrementProperty('step');
            });
        },

        actions: {
            connect: function connect() {
                Ember['default'].run.next(this, function () {
                    this.connectToServer();
                });
            },

            secrets: function secrets() {
                this.transitionToRoute('secrets.index');
            }
        }
    });

});
define('yith-library-mobile-client/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('yith-library-mobile-client/controllers/secret', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ObjectController.extend({

        position: 'current'

    });

});
define('yith-library-mobile-client/controllers/secrets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        auth: Ember['default'].inject.service('auth'),
        settings: Ember['default'].inject.service('settings'),
        sync: Ember['default'].inject.service('sync'),
        queryParams: ['tag'],
        sortProperties: ['service', 'account'],
        sortAscending: true,
        position: 'current',
        state: '',
        tag: '',
        query: '',
        isSyncing: false,
        isAuthorizing: false,
        statusMessage: null,
        isOnline: window.navigator.onLine,

        secrets: (function () {
            var tag = this.get('tag'),
                query = this.get('query'),
                content = this.get('content').sortBy('service', 'account');

            return content.filter(function (item) {
                return item.matches(tag, query);
            });
        }).property('content.isLoaded', 'tag', 'query'),

        secretsCount: (function () {
            return this.get('secrets').length;
        }).property('secrets'),

        secretsNoun: (function () {
            var secretsCount = this.get('secretsCount');
            return secretsCount === 1 ? 'secret' : 'secrets';
        }).property('secretsCount'),

        statusClass: (function () {
            var msg = this.get('statusMessage');
            if (msg === null) {
                return 'hidden';
            } else if (msg === '') {
                return '';
            } else {
                return 'onviewport';
            }
        }).property('statusMessage'),

        showMessage: function showMessage(msg) {
            this.set('statusMessage', msg);
            Ember['default'].run.later(this, function () {
                this.set('statusMessage', '');
                Ember['default'].run.later(this, function () {
                    this.set('statusMessage', null);
                }, 500);
            }, 2500);
        },

        syncFromServer: function syncFromServer() {
            var controller = this,
                auth = this.get('auth'),
                sync = this.get('sync'),
                settings = this.get('settings'),
                accessToken = null,
                clientId = null,
                serverBaseUrl = null;

            if (this.get('isSyncing') === true) {
                return;
            } else {
                this.set('isSyncing', true);

                accessToken = auth.get('accessToken');
                clientId = auth.get('clientId');
                serverBaseUrl = settings.getSetting('serverBaseUrl');

                sync.fetchSecrets(accessToken, serverBaseUrl, clientId).then(function (results) {
                    var msg = [],
                        length;
                    settings.setSetting('lastSync', new Date());
                    controller.set('isSyncing', false);
                    length = results.secrets.length;
                    if (length > 0) {
                        msg.push('' + length);
                        msg.push(length > 1 ? 'secrets have' : 'secret has');
                        msg.push('been succesfully updated');
                    }
                    controller.showMessage(msg.join(' '));
                });
            }
        },

        authorizeInServer: function authorizeInServer() {
            var controller = this,
                auth = this.get('auth'),
                settings = this.get('settings'),
                serverBaseUrl = null;

            if (this.get('isAuthorizing') === true) {
                return;
            } else {
                this.set('isAuthorizing', true);

                serverBaseUrl = settings.getSetting('serverBaseUrl');
                auth.authorize(serverBaseUrl).then(function () {
                    controller.set('isAuthorizing', false);
                    controller.showMessage('You have succesfully logged in');
                });
            }
        },

        logout: function logout() {
            var self = this,
                settings = this.get('settings'),
                sync = this.get('sync'),
                auth = this.get('auth');

            auth.deleteToken();
            settings.deleteSetting('lastAccount');
            sync.deleteAccount().then(function () {
                self.transitionToRoute('firstTime');
            });
        },

        actions: {

            clearQuery: function clearQuery() {
                this.set('query', '');
            },

            offline: function offline() {
                this.set('isOnline', false);
            },

            online: function online() {
                this.set('isOnline', true);
            }

        }
    });

});
define('yith-library-mobile-client/controllers/secrets/drawer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        needs: ['application', 'secrets'],
        sortProperties: ['count:desc'],
        sortedTags: Ember['default'].computed.sort('content', 'sortProperties'),
        tagsToDisplay: 5,
        tag: Ember['default'].computed.alias('controllers.secrets.tag'),

        accountDisplayName: (function () {
            return this.get('controllers.application.model.displayName');
        }).property('controllers.application.model.displayName'),

        selectedTagCount: (function () {
            var tag = this.get('sortedTags').findBy('name', this.get('tag'));
            if (tag) {
                return tag.get('count');
            } else {
                return 0;
            }
        }).property('sortedTags.[]', 'tag'),

        mostUsedTags: (function () {
            var tags = this.get('sortedTags');
            var mostUsed = tags.slice(0, this.get('tagsToDisplay'));
            var selectedTag = this.get('tag');
            var foundSelectedTag = false;
            var wrapped = mostUsed.map(function (element) {
                var name = element.get('name');
                if (name === selectedTag) {
                    foundSelectedTag = true;
                }
                return {
                    'name': name,
                    'count': element.get('count'),
                    'selectTag': name === selectedTag ? '' : name
                };
            });
            if (!foundSelectedTag && selectedTag !== '') {
                wrapped.pop();
                wrapped.push({
                    'name': selectedTag,
                    'count': this.get('selectedTagCount'),
                    'selectTag': ''
                });
            }
            return wrapped;
        }).property('selectedTagCount', 'sortedTags.[]', 'tag', 'tagsToDisplay'),

        hasMoreTags: (function () {
            return this.get('sortedTags').length > this.get('tagsToDisplay');
        }).property('sortedTags.[]', 'tagsToDisplay'),

        syncButtonDisabled: (function () {
            return this.get('controllers.secrets.isSyncing') || !this.get('controllers.secrets.isOnline');
        }).property('controllers.secrets.isSyncing', 'controllers.secrets.isOnline'),

        loginButtonDisabled: (function () {
            return !this.get('isOnline');
        }).property('controllers.secrets.isOnline'),

        actions: {
            login: function login() {
                this.transitionToRoute('secrets');
                Ember['default'].run.next(this, function () {
                    this.get('controllers.secrets').authorizeInServer();
                });
            },

            sync: function sync() {
                this.transitionToRoute('secrets');
                Ember['default'].run.next(this, function () {
                    this.get('controllers.secrets').syncFromServer();
                });
            },

            logout: function logout() {
                this.transitionToRoute('secrets');
                Ember['default'].run.next(this, function () {
                    this.get('controllers.secrets').logout();
                });
            }
        }

    });

});
define('yith-library-mobile-client/controllers/secrets/tags', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        tagsSortProperties: ['name:asc'],
        sortedTags: Ember['default'].computed.sort('content', 'tagsSortProperties'),
        actions: {
            selectTag: function selectTag(tagName) {
                this.transitionToRoute('secrets', { queryParams: { tag: tagName } });
            },

            cancel: function cancel() {
                this.transitionToRoute('secrets');
            }
        }
    });

});
define('yith-library-mobile-client/helpers/current-tag', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Helper.helper(function (params) {
        var tagName = params[0],
            selectedTag = params[1];
        return tagName === selectedTag ? '*' : '';
    });

});
define('yith-library-mobile-client/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'yith-library-mobile-client/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
  };

});
define('yith-library-mobile-client/initializers/export-application-global', ['exports', 'ember', 'yith-library-mobile-client/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('yith-library-mobile-client/main', ['exports', 'ember'], function (exports, Ember) {

  'use strict';



  exports['default'] = bootApp;
  /* global requirejs, require */
  function bootApp(prefix, attributes) {
    var App = require(prefix + '/app')['default'];
    var initializersRegExp = new RegExp(prefix + '/initializers');

    Ember['default'].keys(requirejs._eak_seen).filter(function (key) {
      return initializersRegExp.test(key);
    }).forEach(function (moduleName) {
      var module = require(moduleName, null, null, true);
      if (!module) {
        throw new Error(moduleName + ' must export an initializer.');
      }
      App.initializer(module['default']);
    });

    return App.create(attributes || {});
  }

});
define('yith-library-mobile-client/models/account', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        email: DS['default'].attr('string'),
        firstName: DS['default'].attr('string'),
        lastName: DS['default'].attr('string'),
        screenName: DS['default'].attr('string'),

        fullName: (function () {
            var firstName = this.get('firstName'),
                lastName = this.get('lastName'),
                parts = [];

            if (firstName) {
                parts.push(firstName);
            }
            if (lastName) {
                parts.push(lastName);
            }
            return parts.join(' ');
        }).property('firstName', 'lastName'),

        displayName: (function () {
            var screenName = this.get('screenName'),
                fullName = '';

            if (screenName) {
                return screenName;
            } else {
                fullName = this.get('fullName');
                if (fullName) {
                    return fullName;
                } else {
                    return this.get('email');
                }
            }
        }).property('screenName', 'fullName', 'email')

    });

});
define('yith-library-mobile-client/models/secret', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        service: DS['default'].attr('string'),
        account: DS['default'].attr('string'),
        secret: DS['default'].attr('string'),
        notes: DS['default'].attr('string'),
        tags: DS['default'].attr('string'),

        matches: function matches(tag, query) {
            var tagMatch = tag === '',
                queryMatch = query === '',
                tags = '';
            if (!tagMatch) {
                tags = this.get('tags');
                if (tags) {
                    tagMatch = tags.indexOf(tag) !== -1;
                }
            }
            if (!queryMatch) {
                query = query.toLowerCase();
                queryMatch = this.get('service').toLowerCase().indexOf(query) !== -1 || this.get('account').toLowerCase().indexOf(query) !== -1;
            }
            return tagMatch && queryMatch;
        }
    });

});
define('yith-library-mobile-client/models/tag', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        name: DS['default'].attr('string'),
        count: DS['default'].attr('number')
    });

});
define('yith-library-mobile-client/router', ['exports', 'ember', 'yith-library-mobile-client/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.route('firstTime', { path: '/first-time' });
        this.resource('secrets', { path: '/secrets' }, function () {
            this.resource('secret', { path: '/:secret_id' });
            this.route('tags', { path: '/tags' });
            this.route('drawer', { path: '/drawer' });
        });
    });

    exports['default'] = Router;

});
define('yith-library-mobile-client/routes/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        settings: Ember['default'].inject.service('settings'),

        model: function model() {
            var settings = this.get('settings'),
                lastAccount = settings.getSetting('lastAccount');
            if (lastAccount) {
                return this.store.find('account', lastAccount);
            } else {
                return null;
            }
        },

        afterModel: function afterModel(model) {
            if (model === null) {
                this.transitionTo('firstTime');
            }
        }
    });

});
define('yith-library-mobile-client/routes/first-time', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('yith-library-mobile-client/routes/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        setupController: function setupController() {
            this.transitionTo('secrets');
        }

    });

});
define('yith-library-mobile-client/routes/secret', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        transitionToSecrets: null,

        setupController: function setupController(controller, model) {
            this._super(controller, model);
            var secretsController = this.controllerFor('secrets');
            if (secretsController.get('position') !== 'left') {
                secretsController.set('position', 'left');
            }
            controller.set('position', 'current');
        },

        actions: {
            willTransition: function willTransition(transition) {
                var secretsController = this.controllerFor('secrets');
                if (transition.targetName === 'secrets.index') {
                    if (secretsController.get('position') === 'left') {
                        secretsController.set('position', 'current');
                        this.controller.set('position', 'right');
                        this.set('transitionToSecrets', transition);
                        transition.abort();
                        return false;
                    }
                } else if (transition.targetName === 'secret') {
                    secretsController.set('position', 'left');
                    this.controller.set('position', 'current');
                }

                return true;
            },

            finishTransition: function finishTransition() {
                var transition = this.get('transitionToSecrets');
                if (transition) {
                    this.set('transitionToSecrets', null);
                    transition.retry();
                }
            }
        }

    });

});
define('yith-library-mobile-client/routes/secrets-drawer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        model: function model() {
            return this.store.find('tag');
        },

        renderTemplate: function renderTemplate() {
            this.render({ outlet: 'drawer' });
        }

    });

});
define('yith-library-mobile-client/routes/secrets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        setupController: function setupController(controller, model) {
            this._super(controller, model);
            controller.set('state', '');
        },

        model: function model() {
            return this.store.find('secret');
        },

        actions: {
            willTransition: function willTransition(transition) {
                if (transition.targetName === 'secret') {
                    this.controller.set('position', 'left');
                } else if (transition.targetName === 'secrets.index') {
                    this.controller.set('position', 'current');
                    this.controller.set('state', '');
                }
                return true;
            }

        }

    });

});
define('yith-library-mobile-client/routes/secrets/drawer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        transitionToSecrets: null,

        setupController: function setupController(controller, model) {
            this._super(controller, model);
            this.controllerFor('secrets').set('state', 'drawer-opened');
        },

        model: function model() {
            return this.store.find('tag');
        },

        renderTemplate: function renderTemplate() {
            this.render({ outlet: 'drawer' });
        },

        actions: {
            willTransition: function willTransition(transition) {
                var secretsController = this.controllerFor('secrets');
                if (transition.targetName === 'secrets.index') {
                    // when the transition is retried (see finishTransition)
                    // this if condition will be false
                    if (secretsController.get('state') === 'drawer-opened') {
                        secretsController.set('state', '');
                        this.set('transitionToSecrets', transition);

                        // abort the transition until the CSS transition finishes
                        transition.abort();
                        return false;
                    }
                }
                return true;
            },

            finishTransition: function finishTransition() {
                var transition = this.get('transitionToSecrets');
                if (transition) {
                    this.set('transitionToSecrets', null);
                    transition.retry();
                }
            }
        }

    });

});
define('yith-library-mobile-client/routes/secrets/tags', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        model: function model() {
            return this.store.find('tag');
        }

    });

});
define('yith-library-mobile-client/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].IndexedDBSerializer.extend();

});
define('yith-library-mobile-client/services/auth', ['exports', 'ember', 'yith-library-mobile-client/config/environment', 'yith-library-mobile-client/utils/snake-case-to-camel-case'], function (exports, Ember, ENV, snakeCaseToCamelCase) {

    'use strict';

    exports['default'] = Ember['default'].Service.extend({

        clientId: ENV['default'].defaults.clientId,
        clientBaseUrl: ENV['default'].defaults.clientBaseUrl,
        scope: 'read-passwords read-userinfo',
        accessToken: null,
        accessTokenExpiration: null,

        init: function init() {
            this._super();
            this.loadToken();
        },

        loadToken: function loadToken() {
            var accessToken = window.localStorage.getItem('accessToken'),
                expiration = window.localStorage.getItem('accessTokenExpiration');
            this.set('accessToken', accessToken);
            this.set('accessTokenExpiration', expiration);
        },

        saveToken: function saveToken(token) {
            var expiration = this.now() + parseInt(token.expiresIn, 10);
            this.set('accessToken', token.accessToken);
            this.set('accessTokenExpiration', expiration);
            window.localStorage.setItem('accessToken', token.accessToken);
            window.localStorage.setItem('accessTokenExpiration', expiration);
        },

        deleteToken: function deleteToken() {
            window.localStorage.removeItem('accessToken');
            window.localStorage.removeItem('accessTokenExpiration');
        },

        now: function now() {
            return Math.round(new Date().getTime() / 1000.0);
        },

        uuid: function uuid() {
            var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            return template.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        },

        redirectUri: (function () {
            return this.get('clientBaseUrl') + '/assets/auth-callback.html';
        }).property('clientBaseUrl'),

        authUri: (function () {
            return [this.get('authBaseUri'), '?response_type=token', '&redirect_uri=' + encodeURIComponent(this.get('redirectUri')), '&client_id=' + encodeURIComponent(this.get('clientId')), '&scope=' + encodeURIComponent(this.get('scope'))].join('');
        }).property('authBaseUri', 'providerId', 'clientId', 'scope'),

        hasValidAccessToken: (function () {
            var accessToken = this.get('accessToken'),
                expiration = this.get('accessTokenExpiration');
            return accessToken !== null && this.now() < expiration;
        }).property('accessToken', 'accessTokenExpiration'),

        authorize: function authorize(serverBaseUrl) {
            var self = this,
                state = this.uuid(),
                encodedState = encodeURIComponent(state),
                authUri = this.get('authUri') + '&state=' + encodedState,
                uri = serverBaseUrl + '/oauth2/endpoints/authorization' + authUri,
                dialog = window.open(uri, 'Authorize', 'height=600, width=450'),
                clientBaseUrl = this.get('clientBaseUrl');

            if (window.focus) {
                dialog.focus();
            }

            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                Ember['default'].$(window).on('message', function (event) {
                    var params;
                    if (event.originalEvent.origin === clientBaseUrl) {
                        dialog.close();
                        params = self.parseHash(event.originalEvent.data);
                        if (self.checkResponse(params, state)) {
                            self.saveToken(params);
                            resolve();
                        } else {
                            reject();
                        }
                    }
                });
            });
        },

        parseHash: function parseHash(hash) {
            var params = {},
                queryString = hash.substring(1),
                // remove #
            regex = /([^#?&=]+)=([^&]*)/g,
                match = null,
                key = null;

            while ((match = regex.exec(queryString)) !== null) {
                key = snakeCaseToCamelCase['default'](decodeURIComponent(match[1]));
                params[key] = decodeURIComponent(match[2]);
            }
            return params;
        },

        checkResponse: function checkResponse(params, state) {
            return params.accessToken && params.state === state;
        }

    });

});
define('yith-library-mobile-client/services/settings', ['exports', 'ember', 'yith-library-mobile-client/config/environment'], function (exports, Ember, ENV) {

    'use strict';

    exports['default'] = Ember['default'].Service.extend({

        defaults: {
            'serverBaseUrl': ENV['default'].defaults.serverBaseUrl
        },

        getSetting: function getSetting(name) {
            var setting = window.localStorage.getItem(name);
            if (setting === null) {
                return this.defaults[name] || null;
            } else {
                return JSON.parse(setting);
            }
        },

        setSetting: function setSetting(name, value) {
            var serialized = JSON.stringify(value);
            return window.localStorage.setItem(name, serialized);
        },

        deleteSetting: function deleteSetting(name) {
            window.localStorage.removeItem(name);
        }

    });

});
define('yith-library-mobile-client/services/sync', ['exports', 'ember', 'yith-library-mobile-client/utils/snake-case-to-camel-case'], function (exports, Ember, snakeCaseToCamelCase) {

    'use strict';

    exports['default'] = Ember['default'].Service.extend({

        fetchUserInfo: function fetchUserInfo(accessToken, serverBaseUrl, clientId) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve /*, reject */) {
                Ember['default'].$.ajax({
                    url: serverBaseUrl + '/user?client_id=' + clientId,
                    type: 'GET',
                    crossDomain: true,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).done(function (data /*, textStatus, jqXHR*/) {
                    resolve(data);
                });
            }).then(function (data) {
                return self.updateAccountStore(data);
            });
        },

        /* Convert all the keys of the record to be in camelCase
           instead of snake_case */
        convertRecord: function convertRecord(record) {
            var newRecord = {},
                key = null,
                newKey = null;
            for (key in record) {
                if (record.hasOwnProperty(key)) {
                    newKey = snakeCaseToCamelCase['default'](key);
                    newRecord[newKey] = record[key];
                }
            }
            return newRecord;
        },

        updateAccountStore: function updateAccountStore(rawData) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve /*, reject */) {
                var data = self.convertRecord(rawData);
                self.store.findById('account', data.id).then(function (existingRecord) {
                    // update account
                    existingRecord.set('email', data.email);
                    existingRecord.set('firstName', data.firstName);
                    existingRecord.set('lastName', data.lastName);
                    existingRecord.set('screenName', data.screenName);
                    resolve(existingRecord);
                }, function () {
                    // create account
                    // because we try to find it, it is already in the store
                    // but the record is empty.
                    var newRecord = self.store.recordForId('account', data.id);
                    newRecord.loadedData();
                    newRecord.setProperties({
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        screenName: data.screenName
                    });
                    resolve(newRecord);
                });
            }).then(function (record) {
                return record.save();
            });
        },

        fetchSecrets: function fetchSecrets(accessToken, serverBaseUrl, clientId) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve /*, reject */) {
                Ember['default'].$.ajax({
                    url: serverBaseUrl + '/passwords?client_id=' + clientId,
                    type: 'GET',
                    crossDomain: true,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).done(function (data /*, textStatus, jqXHR*/) {
                    resolve(data);
                });
            }).then(function (data) {
                return self.updateSecretsStore(data);
            });
        },

        updateSecretsStore: function updateSecretsStore(data) {
            var self = this,
                promises = {
                secrets: this.store.find('secret'),
                tags: this.store.find('tag')
            };
            return Ember['default'].RSVP.hash(promises).then(function (results) {
                var secretsPromise = Ember['default'].RSVP.all(self.updateSecrets(results.secrets, data.passwords)),
                    tagsPromise = Ember['default'].RSVP.all(self.updateTags(results.tags, data.passwords));
                return Ember['default'].RSVP.hash({
                    secrets: secretsPromise,
                    tags: tagsPromise
                });
            });
        },

        updateSecrets: function updateSecrets(existingRecords, passwords) {
            var self = this,
                result = [];
            passwords.forEach(function (password) {
                var existingRecord = existingRecords.findBy('id', password.id);
                if (existingRecord !== undefined) {
                    result.push(self.updateSecret(existingRecord, password));
                } else {
                    result.push(self.createSecret(password));
                }
            });
            return result;
        },

        createSecret: function createSecret(data) {
            return this.store.createRecord('secret', {
                id: data.id,
                service: data.service,
                account: data.account,
                secret: data.secret,
                notes: data.notes,
                tags: data.tags.join(' ')
            }).save();
        },

        updateSecret: function updateSecret(record, data) {
            record.set('service', data.service);
            record.set('account', data.account);
            record.set('secret', data.secret);
            record.set('notes', data.notes);
            record.set('tags', data.tags.join(' '));
            return record.save();
        },

        updateTags: function updateTags(existingRecords, passwords) {
            var self = this,
                newTags = new Ember['default'].Map(),
                result = [];
            passwords.forEach(function (password) {
                password.tags.forEach(function (tag) {
                    if (newTags.has(tag)) {
                        newTags.set(tag, newTags.get(tag) + 1);
                    } else {
                        newTags.set(tag, 1);
                    }
                });
            });

            newTags.forEach(function (name, count) {
                var existingRecord = existingRecords.findBy('name', name);
                if (existingRecord !== undefined) {
                    result.push(self.updateTag(existingRecord, name, count));
                } else {
                    result.push(self.createTag(name, count));
                }
            });
            return result;
        },

        createTag: function createTag(name, count) {
            return this.store.createRecord('tag', {
                name: name,
                count: count
            }).save();
        },

        updateTag: function updateTag(record, name, count) {
            record.set('name', name);
            record.set('count', count);
            return record.save();
        },

        deleteAccount: function deleteAccount() {
            var promises = [];
            this.store.all('secret').forEach(function (secret) {
                promises.push(secret.destroyRecord());
            }, this);
            this.store.all('tag').forEach(function (tag) {
                promises.push(tag.destroyRecord());
            }, this);
            this.store.all('account').forEach(function (account) {
                promises.push(account.destroyRecord());
            }, this);

            return Ember['default'].RSVP.all(promises);
        }

    });

});
define('yith-library-mobile-client/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "yith-library-mobile-client/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('yith-library-mobile-client/templates/first-time', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 6
            },
            "end": {
              "line": 29,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("header");
          var el2 = dom.createTextNode("First time steps");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Connect to the server");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("to sign in or sign up");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Retrieve your account information");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("so we know a little bit about you");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Retrieve your secrets");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("and access them even when offline");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3,"type","button");
          dom.setAttribute(el3,"class","recommend");
          var el4 = dom.createTextNode("Connect to YithLibrary.com");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element4 = dom.childAt(fragment, [5, 1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element4);
          return morphs;
        },
        statements: [
          ["element","action",["connect"],[],["loc",[null,[26,52],[26,72]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 31,
                "column": 10
              },
              "end": {
                "line": 33,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            Your secrets are ready!\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 33,
                "column": 10
              },
              "end": {
                "line": 35,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            Running step ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" of 3\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["content","step",["loc",[null,[34,25],[34,33]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child2 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 39,
                "column": 12
              },
              "end": {
                "line": 42,
                "column": 12
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("aside");
            dom.setAttribute(el1,"class","pack-end");
            var el2 = dom.createElement("progress");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("Connecting to the server...");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child3 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 43,
                  "column": 14
                },
                "end": {
                  "line": 45,
                  "column": 14
                }
              },
              "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("p");
              var el2 = dom.createTextNode("Server connected!");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 45,
                  "column": 14
                },
                "end": {
                  "line": 47,
                  "column": 14
                }
              },
              "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("p");
              var el2 = dom.createTextNode("Waiting to connect to server.");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 42,
                "column": 12
              },
              "end": {
                "line": 48,
                "column": 12
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","isServerConnected",["loc",[null,[43,20],[43,37]]]]],[],0,1,["loc",[null,[43,14],[47,21]]]]
          ],
          locals: [],
          templates: [child0, child1]
        };
      }());
      var child4 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 51,
                "column": 12
              },
              "end": {
                "line": 54,
                "column": 12
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("aside");
            dom.setAttribute(el1,"class","pack-end");
            var el2 = dom.createElement("progress");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("Getting account information...");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child5 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 55,
                  "column": 14
                },
                "end": {
                  "line": 57,
                  "column": 14
                }
              },
              "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("p");
              var el2 = dom.createTextNode("Account information retrieved!");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 57,
                  "column": 14
                },
                "end": {
                  "line": 59,
                  "column": 14
                }
              },
              "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("p");
              var el2 = dom.createTextNode("Waiting to retrieve account information.");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 54,
                "column": 12
              },
              "end": {
                "line": 60,
                "column": 12
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","isAccountInformationRetrieved",["loc",[null,[55,20],[55,49]]]]],[],0,1,["loc",[null,[55,14],[59,21]]]]
          ],
          locals: [],
          templates: [child0, child1]
        };
      }());
      var child6 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 63,
                "column": 12
              },
              "end": {
                "line": 66,
                "column": 12
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("aside");
            dom.setAttribute(el1,"class","pack-end");
            var el2 = dom.createElement("progress");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("Getting secrets...");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child7 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 67,
                  "column": 14
                },
                "end": {
                  "line": 69,
                  "column": 14
                }
              },
              "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("p");
              var el2 = dom.createTextNode("Secrets retrieved!");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 69,
                  "column": 14
                },
                "end": {
                  "line": 71,
                  "column": 14
                }
              },
              "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("p");
              var el2 = dom.createTextNode("Waiting to retrieve secrets.");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 66,
                "column": 12
              },
              "end": {
                "line": 72,
                "column": 12
              }
            },
            "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","areSecretsRetrieved",["loc",[null,[67,20],[67,39]]]]],[],0,1,["loc",[null,[67,14],[71,21]]]]
          ],
          locals: [],
          templates: [child0, child1]
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 29,
              "column": 6
            },
            "end": {
              "line": 75,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("header");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [3]);
          var element2 = dom.childAt(element1, [3]);
          var element3 = dom.childAt(element1, [5]);
          var morphs = new Array(6);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
          morphs[2] = dom.createAttrMorph(element2, 'aria-disabled');
          morphs[3] = dom.createMorphAt(element2,1,1);
          morphs[4] = dom.createAttrMorph(element3, 'aria-disabled');
          morphs[5] = dom.createMorphAt(element3,1,1);
          return morphs;
        },
        statements: [
          ["block","if",[["get","isFinished",["loc",[null,[31,17],[31,27]]]]],[],0,1,["loc",[null,[31,10],[35,17]]]],
          ["block","if",[["get","isConnectingToServer",["loc",[null,[39,18],[39,38]]]]],[],2,3,["loc",[null,[39,12],[48,19]]]],
          ["attribute","aria-disabled",["get","accountDisabled",["loc",[null,[50,30],[50,45]]]]],
          ["block","if",[["get","isGettingAccountInformation",["loc",[null,[51,18],[51,45]]]]],[],4,5,["loc",[null,[51,12],[60,19]]]],
          ["attribute","aria-disabled",["get","secretsDisabled",["loc",[null,[62,30],[62,45]]]]],
          ["block","if",[["get","isGettingSecrets",["loc",[null,[63,18],[63,34]]]]],[],6,7,["loc",[null,[63,12],[72,19]]]]
        ],
        locals: [],
        templates: [child0, child1, child2, child3, child4, child5, child6, child7]
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 76,
              "column": 6
            },
            "end": {
              "line": 84,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3,"type","button");
          dom.setAttribute(el3,"class","recommend");
          var el4 = dom.createTextNode("\n              Go to my secrets\n            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [
          ["element","action",["secrets"],[],["loc",[null,[79,52],[79,72]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 93,
            "column": 0
          }
        },
        "moduleName": "yith-library-mobile-client/templates/first-time.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"id","login");
        dom.setAttribute(el1,"role","region");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        dom.setAttribute(el2,"class","fixed");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Yith Library");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("article");
        dom.setAttribute(el2,"class","content scrollable header");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("section");
        dom.setAttribute(el3,"data-type","list");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2,"role","status");
        dom.setAttribute(el2,"class","onviewport");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("v");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" \n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element5 = dom.childAt(fragment, [0]);
        var element6 = dom.childAt(element5, [3, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element6,1,1);
        morphs[1] = dom.createMorphAt(element6,2,2);
        morphs[2] = dom.createMorphAt(dom.childAt(element5, [5, 1, 0]),1,1);
        return morphs;
      },
      statements: [
        ["block","if",[["get","showInstructions",["loc",[null,[8,12],[8,28]]]]],[],0,1,["loc",[null,[8,6],[75,13]]]],
        ["block","if",[["get","isFinished",["loc",[null,[76,12],[76,22]]]]],[],2,null,["loc",[null,[76,6],[84,13]]]],
        ["content","app-version",["loc",[null,[89,15],[89,30]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('yith-library-mobile-client/templates/loading', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 0
          }
        },
        "moduleName": "yith-library-mobile-client/templates/loading.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"id","loading");
        dom.setAttribute(el1,"role","region");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        dom.setAttribute(el2,"class","fixed");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Loading data");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("article");
        dom.setAttribute(el2,"class","content scrollable header");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("header");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createTextNode("Please wait");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("progress");
        dom.setAttribute(el3,"class","pack-activity");
        dom.setAttribute(el3,"max","100");
        dom.setAttribute(el3,"value","0");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('yith-library-mobile-client/templates/secret-revealer', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 11,
              "column": 0
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secret-revealer.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2,"type","text");
          dom.setAttribute(el2,"readonly","");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.setNamespace("http://www.w3.org/2000/svg");
          var el2 = dom.createElement("svg");
          dom.setAttribute(el2,"xmlns","http://www.w3.org/2000/svg");
          dom.setAttribute(el2,"width","40");
          dom.setAttribute(el2,"height","40");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("circle");
          dom.setAttribute(el3,"cx","50%");
          dom.setAttribute(el3,"cy","50%");
          dom.setAttribute(el3,"r","50%");
          dom.setAttribute(el3,"fill","buttonface");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("path");
          dom.setAttribute(el3,"fill","white");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element0, 'value');
          return morphs;
        },
        statements: [
          ["attribute","value",["get","view.decryptedSecret",["loc",[null,[3,40],[3,60]]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 0
            },
            "end": {
              "line": 16,
              "column": 0
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secret-revealer.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2,"type","password");
          dom.setAttribute(el2,"placeholder","Enter your master password here");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"type","reset");
          var el3 = dom.createTextNode("Clear");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 20,
            "column": 0
          }
        },
        "moduleName": "yith-library-mobile-client/templates/secret-revealer.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [1, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createAttrMorph(element1, 'class');
        morphs[2] = dom.createMorphAt(element1,0,0);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["block","if",[["get","view.decryptedSecret",["loc",[null,[1,6],[1,26]]]]],[],0,1,["loc",[null,[1,0],[16,7]]]],
        ["attribute","class",["get","view.buttonClass",["loc",[null,[18,18],[18,34]]]]],
        ["content","view.buttonText",["loc",[null,[18,37],[18,56]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('yith-library-mobile-client/templates/secret', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 6
            },
            "end": {
              "line": 5,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secret.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","icon icon-back");
          var el2 = dom.createTextNode("back");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 6
            },
            "end": {
              "line": 21,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secret.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("header");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h2");
          var el3 = dom.createTextNode("Notes");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          return morphs;
        },
        statements: [
          ["content","notes",["loc",[null,[20,11],[20,20]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 6
            },
            "end": {
              "line": 28,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secret.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("header");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h2");
          var el3 = dom.createTextNode("Tags");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          return morphs;
        },
        statements: [
          ["content","tags",["loc",[null,[27,11],[27,21]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 30,
            "column": 10
          }
        },
        "moduleName": "yith-library-mobile-client/templates/secret.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"data-position","right");
        dom.setAttribute(el1,"role","region");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        dom.setAttribute(el2,"class","fixed");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("article");
        dom.setAttribute(el2,"class","content scrollable header");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("header");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createTextNode("Account");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var morphs = new Array(8);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createElementMorph(element0);
        morphs[2] = dom.createMorphAt(element1,1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [3]),0,0);
        morphs[4] = dom.createMorphAt(element2,1,1);
        morphs[5] = dom.createMorphAt(dom.childAt(element2, [5]),0,0);
        morphs[6] = dom.createMorphAt(element2,7,7);
        morphs[7] = dom.createMorphAt(element2,9,9);
        return morphs;
      },
      statements: [
        ["attribute","class",["get","position",["loc",[null,[1,53],[1,61]]]]],
        ["element","action",["finishTransition"],["on","animationEnd"],["loc",[null,[1,64],[1,115]]]],
        ["block","link-to",["secrets"],[],0,null,["loc",[null,[3,6],[5,18]]]],
        ["content","service",["loc",[null,[6,10],[6,21]]]],
        ["inline","view",["secret-revealer"],["encryptedSecret",["subexpr","@mut",[["get","secret",["loc",[null,[10,47],[10,53]]]]],[],[]]],["loc",[null,[10,6],[10,55]]]],
        ["content","account",["loc",[null,[14,9],[14,20]]]],
        ["block","if",[["get","notes",["loc",[null,[16,12],[16,17]]]]],[],1,null,["loc",[null,[16,6],[21,13]]]],
        ["block","if",[["get","tags",["loc",[null,[23,12],[23,16]]]]],[],2,null,["loc",[null,[23,6],[28,13]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('yith-library-mobile-client/templates/secrets', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 6
            },
            "end": {
              "line": 10,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","icon icon-menu");
          var el2 = dom.createTextNode("menu");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 10
            },
            "end": {
              "line": 23,
              "column": 10
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","tag");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          return morphs;
        },
        statements: [
          ["content","tag",["loc",[null,[22,30],[22,37]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 28,
                "column": 14
              },
              "end": {
                "line": 31,
                "column": 14
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
            return morphs;
          },
          statements: [
            ["content","service",["loc",[null,[29,19],[29,30]]]],
            ["content","account",["loc",[null,[30,19],[30,30]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 26,
              "column": 10
            },
            "end": {
              "line": 33,
              "column": 10
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",["secret",["get","id",["loc",[null,[28,34],[28,36]]]]],[],0,null,["loc",[null,[28,14],[31,26]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 46,
            "column": 0
          }
        },
        "moduleName": "yith-library-mobile-client/templates/secrets.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"data-position","current");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2,"id","secrets");
        dom.setAttribute(el2,"role","region");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("header");
        dom.setAttribute(el3,"class","fixed");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4,"action","#");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","reset");
        var el6 = dom.createTextNode("Remove text");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("article");
        dom.setAttribute(el3,"class","content scrollable header");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"data-type","list");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("header");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("small");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("ul");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"role","status");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element3, [3]);
        var element5 = dom.childAt(element1, [3, 1]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element6, [1]);
        var element8 = dom.childAt(fragment, [2]);
        var morphs = new Array(14);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createMorphAt(element0,1,1);
        morphs[2] = dom.createAttrMorph(element1, 'class');
        morphs[3] = dom.createElementMorph(element1);
        morphs[4] = dom.createMorphAt(element2,1,1);
        morphs[5] = dom.createMorphAt(element3,1,1);
        morphs[6] = dom.createElementMorph(element4);
        morphs[7] = dom.createMorphAt(element7,0,0);
        morphs[8] = dom.createMorphAt(element7,2,2);
        morphs[9] = dom.createMorphAt(element6,3,3);
        morphs[10] = dom.createMorphAt(dom.childAt(element5, [3]),1,1);
        morphs[11] = dom.createAttrMorph(element8, 'class');
        morphs[12] = dom.createMorphAt(dom.childAt(element8, [1]),0,0);
        morphs[13] = dom.createMorphAt(fragment,4,4,contextualElement);
        return morphs;
      },
      statements: [
        ["attribute","class",["get","position",["loc",[null,[1,41],[1,49]]]]],
        ["inline","outlet",[["get","drawer",["loc",[null,[3,11],[3,17]]]]],[],["loc",[null,[3,2],[3,19]]]],
        ["attribute","class",["get","state",["loc",[null,[5,46],[5,51]]]]],
        ["element","action",["finishTransition"],["on","transitionEnd"],["loc",[null,[5,54],[5,102]]]],
        ["block","link-to",["secrets.drawer"],[],0,null,["loc",[null,[8,6],[10,18]]]],
        ["inline","input",[],["placeholder","Search...","value",["subexpr","@mut",[["get","query",["loc",[null,[12,46],[12,51]]]]],[],[]]],["loc",[null,[12,8],[12,53]]]],
        ["element","action",["clearQuery"],[],["loc",[null,[13,29],[13,52]]]],
        ["content","secretsCount",["loc",[null,[20,17],[20,33]]]],
        ["content","secretsNoun",["loc",[null,[20,34],[20,49]]]],
        ["block","if",[["get","tag",["loc",[null,[21,16],[21,19]]]]],[],1,null,["loc",[null,[21,10],[23,17]]]],
        ["block","each",[["get","secrets",["loc",[null,[26,18],[26,25]]]]],[],2,null,["loc",[null,[26,10],[33,19]]]],
        ["attribute","class",["get","statusClass",["loc",[null,[41,31],[41,42]]]]],
        ["content","statusMessage",["loc",[null,[42,5],[42,22]]]],
        ["content","outlet",["loc",[null,[45,0],[45,10]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('yith-library-mobile-client/templates/secrets/drawer', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 6
            },
            "end": {
              "line": 4,
              "column": 32
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Done");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 14,
                "column": 10
              },
              "end": {
                "line": 16,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"href","#");
            var el2 = dom.createTextNode("Sync");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element5 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element5);
            return morphs;
          },
          statements: [
            ["element","action",["closeDrawer"],[],["loc",[null,[15,24],[15,48]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 17,
                  "column": 12
                },
                "end": {
                  "line": 19,
                  "column": 12
                }
              },
              "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("a");
              dom.setAttribute(el1,"href","#");
              var el2 = dom.createTextNode("Syncing ...");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element4 = dom.childAt(fragment, [1]);
              var morphs = new Array(1);
              morphs[0] = dom.createElementMorph(element4);
              return morphs;
            },
            statements: [
              ["element","action",["closeDrawer"],[],["loc",[null,[18,26],[18,50]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 19,
                  "column": 12
                },
                "end": {
                  "line": 21,
                  "column": 12
                }
              },
              "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("a");
              dom.setAttribute(el1,"href","#");
              var el2 = dom.createTextNode("Sync");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element3 = dom.childAt(fragment, [1]);
              var morphs = new Array(1);
              morphs[0] = dom.createElementMorph(element3);
              return morphs;
            },
            statements: [
              ["element","action",["sync"],[],["loc",[null,[20,26],[20,43]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 16,
                "column": 10
              },
              "end": {
                "line": 22,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","isSyncing",["loc",[null,[17,19],[17,28]]]]],[],0,1,["loc",[null,[17,12],[21,19]]]]
          ],
          locals: [],
          templates: [child0, child1]
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 8
            },
            "end": {
              "line": 23,
              "column": 8
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","syncButtonDisabled",["loc",[null,[14,17],[14,35]]]]],[],0,1,["loc",[null,[14,10],[22,17]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 24,
                "column": 10
              },
              "end": {
                "line": 26,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"href","#");
            var el2 = dom.createTextNode("Login");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element2 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element2);
            return morphs;
          },
          statements: [
            ["element","action",["closeDrawer"],[],["loc",[null,[25,24],[25,48]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 27,
                  "column": 12
                },
                "end": {
                  "line": 29,
                  "column": 12
                }
              },
              "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("a");
              dom.setAttribute(el1,"href","#");
              var el2 = dom.createTextNode("Logging in ...");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element1 = dom.childAt(fragment, [1]);
              var morphs = new Array(1);
              morphs[0] = dom.createElementMorph(element1);
              return morphs;
            },
            statements: [
              ["element","action",["closeDrawer"],[],["loc",[null,[28,26],[28,50]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        var child1 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 29,
                  "column": 12
                },
                "end": {
                  "line": 31,
                  "column": 12
                }
              },
              "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("a");
              dom.setAttribute(el1,"href","#");
              var el2 = dom.createTextNode("Log in");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element0 = dom.childAt(fragment, [1]);
              var morphs = new Array(1);
              morphs[0] = dom.createElementMorph(element0);
              return morphs;
            },
            statements: [
              ["element","action",["login"],[],["loc",[null,[30,26],[30,44]]]]
            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 26,
                "column": 10
              },
              "end": {
                "line": 32,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["block","if",[["get","isAuthorizing",["loc",[null,[27,19],[27,32]]]]],[],0,1,["loc",[null,[27,12],[31,19]]]]
          ],
          locals: [],
          templates: [child0, child1]
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 8
            },
            "end": {
              "line": 33,
              "column": 8
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","loginButtonDisableed",["loc",[null,[24,17],[24,37]]]]],[],0,1,["loc",[null,[24,10],[32,17]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 42,
                "column": 10
              },
              "end": {
                "line": 45,
                "column": 10
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" (");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(")\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(3);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
            morphs[2] = dom.createMorphAt(fragment,5,5,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","current-tag",[["get","currentTag.name",["loc",[null,[43,26],[43,41]]]],["get","tag",["loc",[null,[43,42],[43,45]]]]],[],["loc",[null,[43,12],[43,47]]]],
            ["content","currentTag.name",["loc",[null,[44,12],[44,31]]]],
            ["content","currentTag.count",["loc",[null,[44,33],[44,53]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 40,
              "column": 6
            },
            "end": {
              "line": 47,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",["secrets",["subexpr","query-params",[],["tag",["get","currentTag.selectTag",["loc",[null,[42,49],[42,69]]]]],["loc",[null,[42,31],[42,70]]]]],[],0,null,["loc",[null,[42,10],[45,22]]]]
        ],
        locals: ["currentTag"],
        templates: [child0]
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 50,
                "column": 10
              },
              "end": {
                "line": 50,
                "column": 54
              }
            },
            "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("See more tags ...");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 48,
              "column": 6
            },
            "end": {
              "line": 52,
              "column": 6
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",["secrets.tags"],[],0,null,["loc",[null,[50,10],[50,66]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 61,
            "column": 0
          }
        },
        "moduleName": "yith-library-mobile-client/templates/secrets/drawer.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"data-type","sidebar");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("menu");
        dom.setAttribute(el3,"type","toolbar");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Account");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","#");
        var el6 = dom.createTextNode("Log out");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Tags");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2,"role","status");
        dom.setAttribute(el2,"class","onviewport");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("v");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" \n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element6 = dom.childAt(fragment, [0]);
        var element7 = dom.childAt(element6, [1]);
        var element8 = dom.childAt(element6, [3]);
        var element9 = dom.childAt(element8, [3]);
        var element10 = dom.childAt(element9, [3, 0]);
        var element11 = dom.childAt(element8, [7]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(element7, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element7, [3]),0,0);
        morphs[2] = dom.createMorphAt(dom.childAt(element9, [1]),1,1);
        morphs[3] = dom.createElementMorph(element10);
        morphs[4] = dom.createMorphAt(element11,1,1);
        morphs[5] = dom.createMorphAt(element11,2,2);
        morphs[6] = dom.createMorphAt(dom.childAt(element6, [5, 1, 0]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["secrets"],[],0,null,["loc",[null,[4,6],[4,44]]]],
        ["content","accountDisplayName",["loc",[null,[6,8],[6,30]]]],
        ["block","if",[["get","authManager.hasValidAccessToken",["loc",[null,[13,15],[13,46]]]]],[],1,2,["loc",[null,[13,8],[33,15]]]],
        ["element","action",["logout"],[],["loc",[null,[35,22],[35,41]]]],
        ["block","each",[["get","mostUsedTags",["loc",[null,[40,14],[40,26]]]]],[],3,null,["loc",[null,[40,6],[47,15]]]],
        ["block","if",[["get","hasMoreTags",["loc",[null,[48,13],[48,24]]]]],[],4,null,["loc",[null,[48,6],[52,13]]]],
        ["content","app-version",["loc",[null,[57,15],[57,30]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
define('yith-library-mobile-client/templates/secrets/tags', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 8,
              "column": 4
            }
          },
          "moduleName": "yith-library-mobile-client/templates/secrets/tags.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1,"type","button");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" (");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(")\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0,1,1);
          morphs[2] = dom.createMorphAt(element0,3,3);
          return morphs;
        },
        statements: [
          ["element","action",["selectTag",["get","tag.name",["loc",[null,[5,49],[5,57]]]]],[],["loc",[null,[5,28],[5,60]]]],
          ["content","tag.name",["loc",[null,[6,8],[6,20]]]],
          ["content","tag.count",["loc",[null,[6,22],[6,35]]]]
        ],
        locals: ["tag"],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 7
          }
        },
        "moduleName": "yith-library-mobile-client/templates/secrets/tags.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"data-type","action");
        dom.setAttribute(el1,"role","dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        var el3 = dom.createTextNode("Available tags");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("menu");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"type","button");
        var el4 = dom.createTextNode("Cancel");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0, 3]);
        var element2 = dom.childAt(element1, [3]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element1,1,1);
        morphs[1] = dom.createElementMorph(element2);
        return morphs;
      },
      statements: [
        ["block","each",[["get","sortedTags",["loc",[null,[4,12],[4,22]]]]],[],0,null,["loc",[null,[4,4],[8,13]]]],
        ["element","action",["cancel"],[],["loc",[null,[9,26],[9,45]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('yith-library-mobile-client/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/controllers/first-time.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/first-time.js should pass jshint', function() { 
    ok(true, 'controllers/first-time.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/controllers/secret.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/secret.js should pass jshint', function() { 
    ok(true, 'controllers/secret.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/controllers/secrets.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/secrets.js should pass jshint', function() { 
    ok(true, 'controllers/secrets.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/controllers/secrets/drawer.jshint', function () {

  'use strict';

  module('JSHint - controllers/secrets');
  test('controllers/secrets/drawer.js should pass jshint', function() { 
    ok(true, 'controllers/secrets/drawer.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/controllers/secrets/tags.jshint', function () {

  'use strict';

  module('JSHint - controllers/secrets');
  test('controllers/secrets/tags.js should pass jshint', function() { 
    ok(true, 'controllers/secrets/tags.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/helpers/current-tag.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/current-tag.js should pass jshint', function() { 
    ok(true, 'helpers/current-tag.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/helpers/resolver', ['exports', 'ember/resolver', 'yith-library-mobile-client/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('yith-library-mobile-client/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/helpers/start-app', ['exports', 'ember', 'yith-library-mobile-client/app', 'yith-library-mobile-client/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('yith-library-mobile-client/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/main.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('main.js should pass jshint', function() { 
    ok(true, 'main.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/models/account.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/account.js should pass jshint', function() { 
    ok(true, 'models/account.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/models/secret.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/secret.js should pass jshint', function() { 
    ok(true, 'models/secret.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/models/tag.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/tag.js should pass jshint', function() { 
    ok(true, 'models/tag.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/first-time.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/first-time.js should pass jshint', function() { 
    ok(true, 'routes/first-time.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/secret.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/secret.js should pass jshint', function() { 
    ok(true, 'routes/secret.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/secrets-drawer.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/secrets-drawer.js should pass jshint', function() { 
    ok(true, 'routes/secrets-drawer.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/secrets.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/secrets.js should pass jshint', function() { 
    ok(true, 'routes/secrets.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/secrets/drawer.jshint', function () {

  'use strict';

  module('JSHint - routes/secrets');
  test('routes/secrets/drawer.js should pass jshint', function() { 
    ok(true, 'routes/secrets/drawer.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/routes/secrets/tags.jshint', function () {

  'use strict';

  module('JSHint - routes/secrets');
  test('routes/secrets/tags.js should pass jshint', function() { 
    ok(true, 'routes/secrets/tags.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/services/auth.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/auth.js should pass jshint', function() { 
    ok(true, 'services/auth.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/services/settings.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/settings.js should pass jshint', function() { 
    ok(true, 'services/settings.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/services/sync.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/sync.js should pass jshint', function() { 
    ok(true, 'services/sync.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/test-helper', ['yith-library-mobile-client/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('yith-library-mobile-client/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/test-loader', ['ember'], function (Ember) {

  'use strict';

  /* globals requirejs,require */
  Ember['default'].keys(requirejs.entries).forEach(function (entry) {
    if (/\-test/.test(entry)) {
      require(entry, null, null, true);
    }
  });

});
define('yith-library-mobile-client/tests/test-loader.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-loader.js should pass jshint', function() { 
    ok(true, 'test-loader.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/unit/services/auth-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('service:auth', 'Unit | Service | auth', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });

});
define('yith-library-mobile-client/tests/unit/services/auth-test.jshint', function () {

  'use strict';

  module('JSHint - unit/services');
  test('unit/services/auth-test.js should pass jshint', function() { 
    ok(true, 'unit/services/auth-test.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/unit/services/settings-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('service:settings', 'Unit | Service | settings', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });

});
define('yith-library-mobile-client/tests/unit/services/settings-test.jshint', function () {

  'use strict';

  module('JSHint - unit/services');
  test('unit/services/settings-test.js should pass jshint', function() { 
    ok(true, 'unit/services/settings-test.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/unit/services/sync-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('service:sync', 'Unit | Service | sync', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });

});
define('yith-library-mobile-client/tests/unit/services/sync-test.jshint', function () {

  'use strict';

  module('JSHint - unit/services');
  test('unit/services/sync-test.js should pass jshint', function() { 
    ok(true, 'unit/services/sync-test.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/utils/prefix-event.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/prefix-event.js should pass jshint', function() { 
    ok(true, 'utils/prefix-event.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/utils/snake-case-to-camel-case.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/snake-case-to-camel-case.js should pass jshint', function() { 
    ok(true, 'utils/snake-case-to-camel-case.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/views/secret-revealer.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/secret-revealer.js should pass jshint', function() { 
    ok(true, 'views/secret-revealer.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/views/secrets.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/secrets.js should pass jshint', function() { 
    ok(true, 'views/secrets.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/utils/prefix-event', ['exports'], function (exports) {

    'use strict';

    exports['default'] = prefixEvent;

    function prefixEvent(event) {
        var vendorPrefixes = ['webkit', 'moz', 'MS', 'o', ''];
        var prefixedEventNames = vendorPrefixes.map(function (prefix) {
            return prefix ? prefix + event : event.toLowerCase();
        });
        return prefixedEventNames.join(' ');
    }

});
define('yith-library-mobile-client/utils/snake-case-to-camel-case', ['exports'], function (exports) {

    'use strict';

    exports['default'] = snakeCaseToCamelCase;

    function snakeCaseToCamelCase(symbol) {
        return symbol.split('_').filter(function (word) {
            return word !== '';
        }).map(function (word, idx) {
            if (idx === 0) {
                return word;
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
        }).join('');
    }

});
define('yith-library-mobile-client/views/secret-revealer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        templateName: 'secret-revealer',
        tagName: 'form',
        classNames: ['secret-revealer'],
        attributeBindings: ['autocomplete'],
        autocomplete: 'off',
        buttonClass: 'recommend',
        buttonText: 'Reveal secret',
        decryptedSecret: null,
        encryptedSecret: '',

        click: function click(event) {
            var $target = Ember['default'].$(event.target);

            if ($target.is('button')) {
                this.buttonClicked();
            }

            // Don't bubble up any more events
            return false;
        },

        buttonClicked: function buttonClicked() {
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

        hideSecret: function hideSecret() {
            this.stopTimer();

            this.set('buttonText', 'Reveal secret');
            this.set('buttonClass', 'recommend');
            this.set('decryptedSecret', null);
        },

        badMasterPassword: function badMasterPassword() {
            this.set('buttonText', 'Wrong master password, try again');
            this.set('buttonClass', 'danger');
            this.$('input[type=password]').focus();
        },

        revealSecret: function revealSecret(secret) {
            this.set('buttonText', 'Hide secret');
            this.set('buttonClass', 'recommend');
            this.set('decryptedSecret', secret);

            Ember['default'].run.scheduleOnce('afterRender', this, function () {
                this.$('input[type=text]').focus().select();
                this.startTimer();
            });
        },

        startTimer: function startTimer() {
            this.start = new Date();

            this.totalTime = this.getTotalTime();

            this.timer = window.requestAnimationFrame(this.tick.bind(this));
        },

        stopTimer: function stopTimer() {
            if (this.timer) {
                window.cancelAnimationFrame(this.timer);
            }
        },

        getTotalTime: function getTotalTime() {
            return 60;
        },

        tick: function tick() {
            var $timer = this.$('svg'),
                width = $timer.width(),
                width2 = width / 2,
                radius = width * 0.45,
                now = new Date(),
                elapsed = (now - this.start) / 1000.0,
                completion = elapsed / this.totalTime,
                endAngle = 360 * completion,
                endPoint = this.polarToCartesian(width2, width2, radius, endAngle),
                arcSweep = endAngle <= 180 ? '1' : '0',
                d = ['M', width2, width2 - radius, 'A', radius, radius, 0, arcSweep, 0, endPoint.x, endPoint.y, 'L', width2, width2, 'Z'].join(' ');

            this.$('path').attr('d', d);

            // If completion is 100% hide the secret
            if (completion >= 1) {
                this.hideSecret();
            } else {
                this.timer = window.requestAnimationFrame(this.tick.bind(this));
            }
        },

        polarToCartesian: function polarToCartesian(x, y, radius, degrees) {
            var radians = (degrees - 90) * Math.PI / 180.0;
            return {
                x: x + radius * Math.cos(radians),
                y: y + radius * Math.sin(radians)
            };
        },

        didInsertElement: function didInsertElement() {
            this.$('input').focus();
        },

        willDestroy: function willDestroy() {
            this.hideSecret();
        }
    });

});
define('yith-library-mobile-client/views/secrets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNames: ['full-height'],

        didInsertElement: function didInsertElement() {
            window.addEventListener('offline', this);
            window.addEventListener('online', this);
        },

        handleEvent: function handleEvent(event) {
            switch (event.type) {
                case 'offline':
                    this.get('controller').send('offline');
                    break;
                case 'online':
                    this.get('controller').send('online');
                    break;
            }
        },

        willDestroy: function willDestroy() {
            window.removeEventListener('offline', this);
            window.removeEventListener('online', this);
        }
    });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('yith-library-mobile-client/config/environment', ['ember'], function(Ember) {
  var prefix = 'yith-library-mobile-client';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("yith-library-mobile-client/tests/test-helper");
} else {
  require("yith-library-mobile-client/app")["default"].create({"version":"@@projectVersion","name":"yith-library-mobile-client"});
}

/* jshint ignore:end */
//# sourceMappingURL=yith-library-mobile-client.map