/* jshint ignore:start */

/* jshint ignore:end */

define('yith-library-mobile-client/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].IndexedDBAdapter.extend({
        databaseName: "yithlibrary",
        version: 1,
        migrations: function () {
            this.addModel("account", { keyPath: "id", autoIncrement: false });
            this.addModel("secret", { keyPath: "id", autoIncrement: false });
            this.addModel("tag");
        }
    });

});
define('yith-library-mobile-client/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'yith-library-mobile-client/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default'],
    customEvents: {
      "animationend animationEnd webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd": "animationEnd",
      "transitionend transitionEnd webkitTransitionEnd mozTransitionEnd MSTransitionEnd oTransitionEnd": "transitionEnd"
    }
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('yith-library-mobile-client/controllers/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});


	// The active Account object will be set as the model for this controller

});
define('yith-library-mobile-client/controllers/first-time', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ObjectController.extend({
        needs: ["application"],
        step: 0,

        showInstructions: (function () {
            return this.get("step") === 0;
        }).property("step"),

        isConnectingToServer: (function () {
            return this.get("step") === 1;
        }).property("step"),

        isServerConnected: (function () {
            return this.get("step") > 1;
        }).property("step"),

        isGettingAccountInformation: (function () {
            return this.get("step") === 2;
        }).property("step"),

        isAccountInformationRetrieved: (function () {
            return this.get("step") > 2;
        }).property("step"),

        accountDisabled: (function () {
            return this.get("step") < 2 ? "true" : "false";
        }).property("step"),

        isGettingSecrets: (function () {
            return this.get("step") === 3;
        }).property("step"),

        areSecretsRetrieved: (function () {
            return this.get("step") > 3;
        }).property("step"),

        secretsDisabled: (function () {
            return this.get("step") < 3 ? "true" : "false";
        }).property("step"),

        isFinished: (function () {
            return this.get("step") === 4;
        }).property("step"),

        connectToServer: function () {
            var controller = this,
                syncManager = this.syncManager,
                authManager = this.authManager,
                clientId = this.authManager.get("clientId"),
                serverBaseUrl = this.settings.getSetting("serverBaseUrl"),
                accessToken = null;

            this.incrementProperty("step");

            this.authManager.authorize(serverBaseUrl).then(function () {
                accessToken = authManager.get("accessToken");
                controller.incrementProperty("step");
                return syncManager.fetchUserInfo(accessToken, serverBaseUrl, clientId);
            }).then(function (user) {
                controller.settings.setSetting("lastAccount", user.get("id"));
                controller.get("controllers.application").set("model", user);
                controller.incrementProperty("step");
                return syncManager.fetchSecrets(accessToken, serverBaseUrl, clientId);
            }).then(function () {
                controller.settings.setSetting("lastSync", new Date());
                controller.incrementProperty("step");
            });
        },

        actions: {
            connect: function () {
                Ember['default'].run.next(this, function () {
                    this.connectToServer();
                });
            },

            secrets: function () {
                this.transitionToRoute("secrets.index");
            }
        }
    });

});
define('yith-library-mobile-client/controllers/secret', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ObjectController.extend({

        position: "current" });

});
define('yith-library-mobile-client/controllers/secrets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        queryParams: ["tag"],
        sortProperties: ["service", "account"],
        sortAscending: true,
        position: "current",
        state: "",
        tag: "",
        query: "",
        isSyncing: false,
        isAuthorizing: false,
        statusMessage: null,
        isOnline: window.navigator.onLine,

        secrets: (function () {
            var tag = this.get("tag"),
                query = this.get("query"),
                content = this.get("content").sortBy("service", "account");

            return content.filter(function (item) {
                return item.matches(tag, query);
            });
        }).property("content.isLoaded", "tag", "query"),

        secretsCount: (function () {
            return this.get("secrets").length;
        }).property("secrets"),

        secretsNoun: (function () {
            var secretsCount = this.get("secretsCount");
            return secretsCount === 1 ? "secret" : "secrets";
        }).property("secretsCount"),

        statusClass: (function () {
            var msg = this.get("statusMessage");
            if (msg === null) {
                return "hidden";
            } else if (msg === "") {
                return "";
            } else {
                return "onviewport";
            }
        }).property("statusMessage"),

        showMessage: function (msg) {
            this.set("statusMessage", msg);
            Ember['default'].run.later(this, function () {
                this.set("statusMessage", "");
                Ember['default'].run.later(this, function () {
                    this.set("statusMessage", null);
                }, 500);
            }, 2500);
        },

        syncFromServer: function () {
            var controller = this,
                accessToken = null,
                clientId = null,
                serverBaseUrl = null;

            if (this.get("isSyncing") === true) {
                return;
            } else {
                this.set("isSyncing", true);

                accessToken = this.authManager.get("accessToken");
                clientId = this.authManager.get("clientId");
                serverBaseUrl = this.settings.getSetting("serverBaseUrl");

                this.syncManager.fetchSecrets(accessToken, serverBaseUrl, clientId).then(function (results) {
                    var msg = [],
                        length;
                    controller.settings.setSetting("lastSync", new Date());
                    controller.set("isSyncing", false);
                    length = results.secrets.length;
                    if (length > 0) {
                        msg.push("" + length);
                        msg.push(length > 1 ? "secrets have" : "secret has");
                        msg.push("been succesfully updated");
                    }
                    controller.showMessage(msg.join(" "));
                });
            }
        },

        authorizeInServer: function () {
            var controller = this,
                serverBaseUrl = null;

            if (this.get("isAuthorizing") === true) {
                return;
            } else {
                this.set("isAuthorizing", true);

                serverBaseUrl = this.settings.getSetting("serverBaseUrl");
                this.authManager.authorize(serverBaseUrl).then(function () {
                    controller.set("isAuthorizing", false);
                    controller.showMessage("You have succesfully logged in");
                });
            }
        },

        logout: function () {
            var self = this;
            this.authManager.deleteToken();
            this.settings.deleteSetting("lastAccount");
            this.syncManager.deleteAccount().then(function () {
                self.transitionToRoute("firstTime");
            });
        },

        actions: {

            clearQuery: function () {
                this.set("query", "");
            },

            offline: function () {
                this.set("isOnline", false);
            },

            online: function () {
                this.set("isOnline", true);
            }

        }
    });

});
define('yith-library-mobile-client/controllers/secrets/drawer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        needs: ["application", "secrets"],
        sortProperties: ["count:desc"],
        sortedTags: Ember['default'].computed.sort("content", "sortProperties"),
        tagsToDisplay: 5,
        tag: Ember['default'].computed.alias("controllers.secrets.tag"),

        accountDisplayName: (function () {
            return this.get("controllers.application.model.displayName");
        }).property("controllers.application.model.displayName"),

        selectedTagCount: (function () {
            var tag = this.get("sortedTags").findBy("name", this.get("tag"));
            if (tag) {
                return tag.get("count");
            } else {
                return 0;
            }
        }).property("sortedTags.[]", "tag"),

        mostUsedTags: (function () {
            var tags = this.get("sortedTags");
            var mostUsed = tags.slice(0, this.get("tagsToDisplay"));
            var selectedTag = this.get("tag");
            var foundSelectedTag = false;
            var wrapped = mostUsed.map(function (element) {
                var name = element.get("name");
                if (name === selectedTag) {
                    foundSelectedTag = true;
                }
                return {
                    name: name,
                    count: element.get("count"),
                    selectTag: name === selectedTag ? "" : name
                };
            });
            if (!foundSelectedTag && selectedTag !== "") {
                wrapped.pop();
                wrapped.push({
                    name: selectedTag,
                    count: this.get("selectedTagCount"),
                    selectTag: ""
                });
            }
            return wrapped;
        }).property("selectedTagCount", "sortedTags.[]", "tag", "tagsToDisplay"),

        hasMoreTags: (function () {
            return this.get("sortedTags").length > this.get("tagsToDisplay");
        }).property("sortedTags.[]", "tagsToDisplay"),

        syncButtonDisabled: (function () {
            return this.get("controllers.secrets.isSyncing") || !this.get("controllers.secrets.isOnline");
        }).property("controllers.secrets.isSyncing", "controllers.secrets.isOnline"),

        loginButtonDisabled: (function () {
            return !this.get("isOnline");
        }).property("controllers.secrets.isOnline"),

        actions: {
            login: function () {
                this.transitionToRoute("secrets");
                Ember['default'].run.next(this, function () {
                    this.get("controllers.secrets").authorizeInServer();
                });
            },

            sync: function () {
                this.transitionToRoute("secrets");
                Ember['default'].run.next(this, function () {
                    this.get("controllers.secrets").syncFromServer();
                });
            },

            logout: function () {
                this.transitionToRoute("secrets");
                Ember['default'].run.next(this, function () {
                    this.get("controllers.secrets").logout();
                });
            }
        }

    });

});
define('yith-library-mobile-client/controllers/secrets/tags', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        tagsSortProperties: ["name:asc"],
        sortedTags: Ember['default'].computed.sort("content", "tagsSortProperties"),
        actions: {
            selectTag: function (tagName) {
                this.transitionToRoute("secrets", { queryParams: { tag: tagName } });
            },

            cancel: function () {
                this.transitionToRoute("secrets");
            }
        }
    });

});
define('yith-library-mobile-client/helpers/current-tag', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (tagName, selectedTag) {
        return tagName === selectedTag ? "*" : "";
    });

});
define('yith-library-mobile-client/helpers/current-version', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function () {
        var versionStatus = ["<section role=\"status\" class=\"onviewport\">",
        //        '<p><small>v' + YithLibraryMobileClient.get('version') + '</small></p>',
        "</section>"];
        return new Ember['default'].Handlebars.SafeString(versionStatus.join(""));
    });

});
define('yith-library-mobile-client/initializers/app-version', ['exports', 'yith-library-mobile-client/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function (container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('yith-library-mobile-client/initializers/authmanager', ['exports', 'yith-library-mobile-client/utils/authmanager'], function (exports, AuthManager) {

    'use strict';

    exports['default'] = {
        name: "authManager",

        initialize: function (container, application) {
            application.register("authmanager:main", AuthManager['default']);

            application.inject("controller", "authManager", "authmanager:main");
        }
    };

});
define('yith-library-mobile-client/initializers/export-application-global', ['exports', 'ember', 'yith-library-mobile-client/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === "string") {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  };

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('yith-library-mobile-client/initializers/settings', ['exports', 'yith-library-mobile-client/utils/settings'], function (exports, Settings) {

    'use strict';

    exports['default'] = {
        name: "settings",

        initialize: function (container, application) {
            application.register("settings:main", Settings['default']);

            application.inject("route", "settings", "settings:main");
            application.inject("controller", "settings", "settings:main");
        }
    };

});
define('yith-library-mobile-client/initializers/syncmanager', ['exports', 'yith-library-mobile-client/utils/syncmanager'], function (exports, SyncManager) {

    'use strict';

    exports['default'] = {
        name: "syncManager",

        initialize: function (container, application) {
            application.register("syncmanager:main", SyncManager['default']);

            application.inject("controller", "syncManager", "syncmanager:main");
            application.inject("syncmanager", "store", "store:main");
        }
    };

});
define('yith-library-mobile-client/main', ['exports', 'ember'], function (exports, Ember) {

  'use strict';



  exports['default'] = bootApp;
  /* global requirejs, require */
  function bootApp(prefix, attributes) {
    var App = require(prefix + "/app")["default"];
    var initializersRegExp = new RegExp(prefix + "/initializers");

    Ember['default'].keys(requirejs._eak_seen).filter(function (key) {
      return initializersRegExp.test(key);
    }).forEach(function (moduleName) {
      var module = require(moduleName, null, null, true);
      if (!module) {
        throw new Error(moduleName + " must export an initializer.");
      }
      App.initializer(module["default"]);
    });

    return App.create(attributes || {});
  }

});
define('yith-library-mobile-client/models/account', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        email: DS['default'].attr("string"),
        firstName: DS['default'].attr("string"),
        lastName: DS['default'].attr("string"),
        screenName: DS['default'].attr("string"),

        fullName: (function () {
            var firstName = this.get("firstName"),
                lastName = this.get("lastName"),
                parts = [];

            if (firstName) {
                parts.push(firstName);
            }
            if (lastName) {
                parts.push(lastName);
            }
            return parts.join(" ");
        }).property("firstName", "lastName"),

        displayName: (function () {
            var screenName = this.get("screenName"),
                fullName = "";

            if (screenName) {
                return screenName;
            } else {
                fullName = this.get("fullName");
                if (fullName) {
                    return fullName;
                } else {
                    return this.get("email");
                }
            }
        }).property("screenName", "fullName", "email")

    });

});
define('yith-library-mobile-client/models/secret', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        service: DS['default'].attr("string"),
        account: DS['default'].attr("string"),
        secret: DS['default'].attr("string"),
        notes: DS['default'].attr("string"),
        tags: DS['default'].attr("string"),

        matches: function (tag, query) {
            var tagMatch = tag === "",
                queryMatch = query === "",
                tags = "";
            if (!tagMatch) {
                tags = this.get("tags");
                if (tags) {
                    tagMatch = tags.indexOf(tag) !== -1;
                }
            }
            if (!queryMatch) {
                query = query.toLowerCase();
                queryMatch = this.get("service").toLowerCase().indexOf(query) !== -1 || this.get("account").toLowerCase().indexOf(query) !== -1;
            }
            return tagMatch && queryMatch;
        }
    });

});
define('yith-library-mobile-client/models/tag', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        name: DS['default'].attr("string"),
        count: DS['default'].attr("number")
    });

});
define('yith-library-mobile-client/router', ['exports', 'ember', 'yith-library-mobile-client/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.route("firstTime", { path: "/first-time" });
        this.resource("secrets", { path: "/secrets" }, function () {
            this.resource("secret", { path: "/:secret_id" });
            this.route("tags", { path: "/tags" });
            this.route("drawer", { path: "/drawer" });
        });
    });

    exports['default'] = Router;

});
define('yith-library-mobile-client/routes/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function () {
            var lastAccount = this.settings.getSetting("lastAccount");
            if (lastAccount) {
                return this.store.find("account", lastAccount);
            } else {
                return null;
            }
        },

        afterModel: function (model) {
            if (model === null) {
                this.transitionTo("firstTime");
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

        setupController: function () {
            this.transitionTo("secrets");
        }

    });

});
define('yith-library-mobile-client/routes/secret', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        transitionToSecrets: null,

        setupController: function (controller, model) {
            this._super(controller, model);
            var secretsController = this.controllerFor("secrets");
            if (secretsController.get("position") !== "left") {
                secretsController.set("position", "left");
            }
            controller.set("position", "current");
        },

        actions: {
            willTransition: function (transition) {
                var secretsController = this.controllerFor("secrets");
                if (transition.targetName === "secrets.index") {
                    if (secretsController.get("position") === "left") {
                        secretsController.set("position", "current");
                        this.controller.set("position", "right");
                        this.set("transitionToSecrets", transition);
                        transition.abort();
                        return false;
                    }
                } else if (transition.targetName === "secret") {
                    secretsController.set("position", "left");
                    this.controller.set("position", "current");
                }

                return true;
            },

            finishTransition: function () {
                var transition = this.get("transitionToSecrets");
                if (transition) {
                    this.set("transitionToSecrets", null);
                    transition.retry();
                }
            }
        }

    });

});
define('yith-library-mobile-client/routes/secrets-drawer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        model: function () {
            return this.store.find("tag");
        },

        renderTemplate: function () {
            this.render({ outlet: "drawer" });
        }

    });

});
define('yith-library-mobile-client/routes/secrets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        setupController: function (controller, model) {
            this._super(controller, model);
            controller.set("state", "");
        },

        model: function () {
            return this.store.find("secret");
        },

        actions: {
            willTransition: function (transition) {
                if (transition.targetName === "secret") {
                    this.controller.set("position", "left");
                } else if (transition.targetName === "secrets.index") {
                    this.controller.set("position", "current");
                    this.controller.set("state", "");
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

        setupController: function (controller, model) {
            this._super(controller, model);
            this.controllerFor("secrets").set("state", "drawer-opened");
        },

        model: function () {
            return this.store.find("tag");
        },

        renderTemplate: function () {
            this.render({ outlet: "drawer" });
        },

        actions: {
            willTransition: function (transition) {
                var secretsController = this.controllerFor("secrets");
                if (transition.targetName === "secrets.index") {
                    // when the transition is retried (see finishTransition)
                    // this if condition will be false
                    if (secretsController.get("state") === "drawer-opened") {
                        secretsController.set("state", "");
                        this.set("transitionToSecrets", transition);

                        // abort the transition until the CSS transition finishes
                        transition.abort();
                        return false;
                    }
                }
                return true;
            },

            finishTransition: function () {
                var transition = this.get("transitionToSecrets");
                if (transition) {
                    this.set("transitionToSecrets", null);
                    transition.retry();
                }
            }
        }

    });

});
define('yith-library-mobile-client/routes/secrets/tags', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({

        model: function () {
            return this.store.find("tag");
        }

    });

});
define('yith-library-mobile-client/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].IndexedDBSerializer.extend();

});
define('yith-library-mobile-client/templates/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1;


    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('yith-library-mobile-client/templates/first-time', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n            <header>First time steps</header>\n            <ul>\n              <li>\n                <p>Connect to the server</p>\n                <p>to sign in or sign up</p>\n              </li>\n              <li>\n                <p>Retrieve your account information</p>\n                <p>so we know a little bit about you</p>\n              </li>\n              <li>\n                <p>Retrieve your secrets</p>\n                <p>and access them even when offline</p>\n              </li>\n            </ul>\n            <form>\n              <p>\n                <button type=\"button\" class=\"recommend\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "connect", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Connect to YithLibrary.com</button>\n              </p>\n            </form>\n          ");
    return buffer;
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            <header>\n              ");
    stack1 = helpers['if'].call(depth0, "isFinished", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n            </header>\n            <ul>\n              <li>\n                ");
    stack1 = helpers['if'].call(depth0, "isConnectingToServer", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n              </li>\n              <li ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'aria-disabled': ("accountDisabled")
    },hashTypes:{'aria-disabled': "STRING"},hashContexts:{'aria-disabled': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">\n                ");
    stack1 = helpers['if'].call(depth0, "isGettingAccountInformation", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n              </li>\n              <li ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'aria-disabled': ("secretsDisabled")
    },hashTypes:{'aria-disabled': "STRING"},hashContexts:{'aria-disabled': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">\n                ");
    stack1 = helpers['if'].call(depth0, "isGettingSecrets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(24, program24, data),fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n              </li>\n            </ul>\n          </section>\n          ");
    stack1 = helpers['if'].call(depth0, "isFinished", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(29, program29, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        ");
    return buffer;
    }
  function program4(depth0,data) {
    
    
    data.buffer.push("\n                Your secrets are ready!\n              ");
    }

  function program6(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                Running step ");
    stack1 = helpers._triageMustache.call(depth0, "step", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(" of 3\n              ");
    return buffer;
    }

  function program8(depth0,data) {
    
    
    data.buffer.push("\n                  <aside class=\"pack-end\">\n                    <progress></progress>\n                  </aside>\n                  <p>Connecting to the server...</p>\n                ");
    }

  function program10(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                  ");
    stack1 = helpers['if'].call(depth0, "isServerConnected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                ");
    return buffer;
    }
  function program11(depth0,data) {
    
    
    data.buffer.push("\n                    <p>Server connected!</p>\n                  ");
    }

  function program13(depth0,data) {
    
    
    data.buffer.push("\n                    <p>Waiting to connect to server.</p>\n                  ");
    }

  function program15(depth0,data) {
    
    
    data.buffer.push("\n                  <aside class=\"pack-end\">\n                    <progress></progress>\n                  </aside>\n                  <p>Getting account information...</p>\n                ");
    }

  function program17(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                  ");
    stack1 = helpers['if'].call(depth0, "isAccountInformationRetrieved", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(20, program20, data),fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                ");
    return buffer;
    }
  function program18(depth0,data) {
    
    
    data.buffer.push("\n                    <p>Account information retrieved!</p>\n                  ");
    }

  function program20(depth0,data) {
    
    
    data.buffer.push("\n                    <p>Waiting to retrieve account information.</p>\n                  ");
    }

  function program22(depth0,data) {
    
    
    data.buffer.push("\n                  <aside class=\"pack-end\">\n                    <progress></progress>\n                  </aside>\n                  <p>Getting secrets...</p>\n                ");
    }

  function program24(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                  ");
    stack1 = helpers['if'].call(depth0, "areSecretsRetrieved", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(27, program27, data),fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                ");
    return buffer;
    }
  function program25(depth0,data) {
    
    
    data.buffer.push("\n                    <p>Secrets retrieved!</p>\n                  ");
    }

  function program27(depth0,data) {
    
    
    data.buffer.push("\n                    <p>Waiting to retrieve secrets.</p>\n                  ");
    }

  function program29(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n            <form>\n              <p>\n                <button type=\"button\" class=\"recommend\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "secrets", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">\n                  Go to my secrets\n                </button>\n              </p>\n            </form>\n          ");
    return buffer;
    }

    data.buffer.push("    <section id=\"login\" role=\"region\">\n      <header class=\"fixed\">\n        <h1>Yith Library</h1>\n      </header>\n\n      <article class=\"content scrollable header\">\n        <section data-type=\"list\">\n          ");
    stack1 = helpers['if'].call(depth0, "showInstructions", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      </article>\n\n      ");
    stack1 = helpers._triageMustache.call(depth0, "current-version", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n\n    </section>\n");
    return buffer;
    
  });

});
define('yith-library-mobile-client/templates/loading', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    


    data.buffer.push("<section id=\"loading\" role=\"region\">\n  <header class=\"fixed\">\n    <h1>Loading data</h1>\n  </header>\n  <article class=\"content scrollable header\">\n    <header>\n      <h2>Please wait</h2>\n    </header>\n    <progress class=\"pack-activity\" max=\"100\" value=\"0\"></progress>\n  </article>\n</section>\n");
    
  });

});
define('yith-library-mobile-client/templates/secret-revealer', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n  <p>\n    <input type=\"text\" readonly ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'value': ("view.decryptedSecret")
    },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(" />\n  </p>\n  <p>\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\">\n      <circle cx=\"50%\" cy=\"50%\" r=\"50%\" fill=\"buttonface\" />\n      <path fill=\"white\" />\n    </svg>\n  </p>\n");
    return buffer;
    }

  function program3(depth0,data) {
    
    
    data.buffer.push("\n  <p>\n    <input type=\"password\" placeholder=\"Enter your master password here\" autofocus />\n    <button type=\"reset\">Clear</button>\n  </p>\n");
    }

    stack1 = helpers['if'].call(depth0, "view.decryptedSecret", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n<p>\n  <button ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'class': ("view.buttonClass")
    },hashTypes:{'class': "ID"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">");
    stack1 = helpers._triageMustache.call(depth0, "view.buttonText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</button>\n</p>\n");
    return buffer;
    
  });

});
define('yith-library-mobile-client/templates/secret', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    
    data.buffer.push("\n        <span class=\"icon icon-back\">back</span>\n      ");
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n        <header>\n          <h2>Notes</h2>\n        </header>\n        <p>");
    stack1 = helpers._triageMustache.call(depth0, "notes", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n      ");
    return buffer;
    }

  function program5(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n        <header>\n          <h2>Tags</h2>\n        </header>\n        <p>");
    stack1 = helpers._triageMustache.call(depth0, "tags", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n      ");
    return buffer;
    }

    data.buffer.push("<section data-position=\"right\" role=\"region\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'class': ("position")
    },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "finishTransition", {hash:{
      'on': ("animationEnd")
    },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(" >\n    <header class=\"fixed\">\n      ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "secrets", options) : helperMissing.call(depth0, "link-to", "secrets", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      <h1>");
    stack1 = helpers._triageMustache.call(depth0, "service", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</h1>\n    </header>\n\n    <article class=\"content scrollable header\">\n      ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "secret-revealer", {hash:{
      'encryptedSecret': ("secret")
    },hashTypes:{'encryptedSecret': "ID"},hashContexts:{'encryptedSecret': depth0},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push("\n      <header>\n        <h2>Account</h2>\n      </header>\n      <p>");
    stack1 = helpers._triageMustache.call(depth0, "account", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n\n      ");
    stack1 = helpers['if'].call(depth0, "notes", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n\n      ");
    stack1 = helpers['if'].call(depth0, "tags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </article>\n</section>");
    return buffer;
    
  });

});
define('yith-library-mobile-client/templates/secrets', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    
    data.buffer.push("\n        <span class=\"icon icon-menu\">menu</span>\n      ");
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            <span class=\"tag\">");
    stack1 = helpers._triageMustache.call(depth0, "tag", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</span>\n          ");
    return buffer;
    }

  function program5(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n            <li>\n              ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "secret", "id", options) : helperMissing.call(depth0, "link-to", "secret", "id", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n            </li>\n          ");
    return buffer;
    }
  function program6(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                <p>");
    stack1 = helpers._triageMustache.call(depth0, "service", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n                <p>");
    stack1 = helpers._triageMustache.call(depth0, "account", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n              ");
    return buffer;
    }

    data.buffer.push("<section data-position=\"current\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'class': ("position")
    },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">\n\n  ");
    data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "drawer", options) : helperMissing.call(depth0, "outlet", "drawer", options))));
    data.buffer.push("\n\n  <section id=\"secrets\" role=\"region\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'class': ("state")
    },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "finishTransition", {hash:{
      'on': ("transitionEnd")
    },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">\n\n    <header class=\"fixed\">\n      ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "secrets.drawer", options) : helperMissing.call(depth0, "link-to", "secrets.drawer", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      <form action=\"#\">\n        ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'placeholder': ("Search..."),
      'value': ("query")
    },hashTypes:{'placeholder': "STRING",'value': "ID"},hashContexts:{'placeholder': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n        <button type=\"reset\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "clearQuery", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Remove text</button>\n      </form>\n    </header>\n\n    <article class=\"content scrollable header\">\n      <div data-type=\"list\">\n        <header>\n          <small>");
    stack1 = helpers._triageMustache.call(depth0, "secretsCount", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(" ");
    stack1 = helpers._triageMustache.call(depth0, "secretsNoun", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</small>\n          ");
    stack1 = helpers['if'].call(depth0, "tag", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </header>\n        <ul>\n          ");
    stack1 = helpers.each.call(depth0, "secrets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </ul>\n      </div>\n    </article>\n  </section>\n\n</section>\n\n<section role=\"status\" ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'class': ("statusClass")
    },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">\n  <p>");
    stack1 = helpers._triageMustache.call(depth0, "statusMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n</section>\n\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('yith-library-mobile-client/templates/secrets/drawer', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    
    data.buffer.push("Done");
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n          ");
    stack1 = helpers['if'].call(depth0, "syncButtonDisabled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        ");
    return buffer;
    }
  function program4(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n            <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeDrawer", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Sync</a>\n          ");
    return buffer;
    }

  function program6(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            ");
    stack1 = helpers['if'].call(depth0, "isSyncing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n          ");
    return buffer;
    }
  function program7(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n              <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeDrawer", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Syncing ...</a>\n            ");
    return buffer;
    }

  function program9(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n              <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "sync", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Sync</a>\n            ");
    return buffer;
    }

  function program11(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n          ");
    stack1 = helpers['if'].call(depth0, "loginButtonDisableed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        ");
    return buffer;
    }
  function program12(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n            <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeDrawer", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Login</a>\n          ");
    return buffer;
    }

  function program14(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            ");
    stack1 = helpers['if'].call(depth0, "isAuthorizing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n          ");
    return buffer;
    }
  function program15(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n              <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeDrawer", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Logging in ...</a>\n            ");
    return buffer;
    }

  function program17(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n              <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "login", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Log in</a>\n            ");
    return buffer;
    }

  function program19(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n        <li>\n          ");
    stack1 = (helper = helpers['query-params'] || (depth0 && depth0['query-params']),options={hash:{
      'tag': ("currentTag.selectTag")
    },hashTypes:{'tag': "ID"},hashContexts:{'tag': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "query-params", options));
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0,depth0],types:["STRING","sexpr"],data:data},helper ? helper.call(depth0, "secrets", stack1, options) : helperMissing.call(depth0, "link-to", "secrets", stack1, options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </li>\n      ");
    return buffer;
    }
  function program20(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n            ");
    data.buffer.push(escapeExpression((helper = helpers['current-tag'] || (depth0 && depth0['current-tag']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","ID"],data:data},helper ? helper.call(depth0, "currentTag.name", "tag", options) : helperMissing.call(depth0, "current-tag", "currentTag.name", "tag", options))));
    data.buffer.push("\n            ");
    stack1 = helpers._triageMustache.call(depth0, "currentTag.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(" (");
    stack1 = helpers._triageMustache.call(depth0, "currentTag.count", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(")\n          ");
    return buffer;
    }

  function program22(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n        <li>\n          ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "secrets.tags", options) : helperMissing.call(depth0, "link-to", "secrets.tags", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </li>\n      ");
    return buffer;
    }
  function program23(depth0,data) {
    
    
    data.buffer.push("See more tags ...");
    }

    data.buffer.push("<section data-type=\"sidebar\">\n  <header>\n    <menu type=\"toolbar\">\n      ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "secrets", options) : helperMissing.call(depth0, "link-to", "secrets", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </menu>\n    <h1>");
    stack1 = helpers._triageMustache.call(depth0, "accountDisplayName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</h1>\n  </header>\n\n  <nav>\n    <h2>Account</h2>\n    <ul>\n      <li>\n        ");
    stack1 = helpers['if'].call(depth0, "authManager.hasValidAccessToken", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      </li>\n      <li><a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "logout", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Log out</a></li>\n    </ul>\n\n    <h2>Tags</h2>\n    <ul>\n      ");
    stack1 = helpers.each.call(depth0, "currentTag", "in", "mostUsedTags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      ");
    stack1 = helpers['if'].call(depth0, "hasMoreTags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </ul>\n  </nav>\n  ");
    stack1 = helpers._triageMustache.call(depth0, "current-version", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n</section>\n");
    return buffer;
    
  });

});
define('yith-library-mobile-client/templates/secrets/tags', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
  /**/) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n      <button type='button' ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectTag", "tag.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(">\n        ");
    stack1 = helpers._triageMustache.call(depth0, "tag.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(" (");
    stack1 = helpers._triageMustache.call(depth0, "tag.count", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(")\n      </button>\n    ");
    return buffer;
    }

    data.buffer.push("<form data-type=\"action\" role=\"dialog\">\n  <header>Available tags</header>\n  <menu>\n    ");
    stack1 = helpers.each.call(depth0, "tag", "in", "sortedTags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    <button type='button' ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Cancel</button>\n  </menu>\n</form>");
    return buffer;
    
  });

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
define('yith-library-mobile-client/tests/helpers/current-version.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/current-version.js should pass jshint', function() { 
    ok(true, 'helpers/current-version.js should pass jshint.'); 
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
define('yith-library-mobile-client/tests/helpers/start-app', ['exports', 'ember', 'yith-library-mobile-client/app', 'yith-library-mobile-client/router', 'yith-library-mobile-client/config/environment'], function (exports, Ember, Application, Router, config) {

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
define('yith-library-mobile-client/tests/initializers/authmanager.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/authmanager.js should pass jshint', function() { 
    ok(true, 'initializers/authmanager.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/initializers/settings.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/settings.js should pass jshint', function() { 
    ok(true, 'initializers/settings.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/initializers/syncmanager.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/syncmanager.js should pass jshint', function() { 
    ok(true, 'initializers/syncmanager.js should pass jshint.'); 
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
define('yith-library-mobile-client/tests/utils/authmanager.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/authmanager.js should pass jshint', function() { 
    ok(true, 'utils/authmanager.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/utils/prefix-event.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/prefix-event.js should pass jshint', function() { 
    ok(true, 'utils/prefix-event.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/utils/settings.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/settings.js should pass jshint', function() { 
    ok(true, 'utils/settings.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/utils/snake-case-to-camel-case.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/snake-case-to-camel-case.js should pass jshint', function() { 
    ok(true, 'utils/snake-case-to-camel-case.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/utils/syncmanager.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/syncmanager.js should pass jshint', function() { 
    ok(true, 'utils/syncmanager.js should pass jshint.'); 
  });

});
define('yith-library-mobile-client/tests/views/application.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/application.js should pass jshint', function() { 
    ok(true, 'views/application.js should pass jshint.'); 
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
define('yith-library-mobile-client/utils/authmanager', ['exports', 'ember', 'yith-library-mobile-client/utils/snake-case-to-camel-case', 'yith-library-mobile-client/config/environment'], function (exports, Ember, snakeCaseToCamelCase, ENV) {

    'use strict';

    exports['default'] = Ember['default'].Object.extend({

        clientId: ENV['default'].defaults.clientId,
        clientBaseUrl: ENV['default'].defaults.clientBaseUrl,
        scope: "read-passwords read-userinfo",
        accessToken: null,
        accessTokenExpiration: null,

        init: function () {
            this._super();
            this.loadToken();
        },

        redirectUri: (function () {
            return this.get("clientBaseUrl") + "/assets/auth-callback.html";
        }).property("clientBaseUrl"),

        authUri: (function () {
            return [this.get("authBaseUri"), "?response_type=token", "&redirect_uri=" + encodeURIComponent(this.get("redirectUri")), "&client_id=" + encodeURIComponent(this.get("clientId")), "&scope=" + encodeURIComponent(this.get("scope"))].join("");
        }).property("authBaseUri", "providerId", "clientId", "scope"),

        hasValidAccessToken: (function () {
            var accessToken = this.get("accessToken"),
                expiration = this.get("accessTokenExpiration");
            return accessToken !== null && this.now() < expiration;
        }).property("accessToken", "accessTokenExpiration"),

        authorize: function (serverBaseUrl) {
            var self = this,
                state = this.uuid(),
                encodedState = encodeURIComponent(state),
                authUri = this.get("authUri") + "&state=" + encodedState,
                uri = serverBaseUrl + "/oauth2/endpoints/authorization" + authUri,
                dialog = window.open(uri, "Authorize", "height=600, width=450"),
                clientBaseUrl = this.get("clientBaseUrl");

            if (window.focus) {
                dialog.focus();
            }

            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                Ember['default'].$(window).on("message", function (event) {
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

        parseHash: function (hash) {
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

        checkResponse: function (params, state) {
            return params.accessToken && params.state === state;
        },

        saveToken: function (token) {
            var expiration = this.now() + parseInt(token.expiresIn, 10);
            this.set("accessToken", token.accessToken);
            this.set("accessTokenExpiration", expiration);
            window.localStorage.setItem("accessToken", token.accessToken);
            window.localStorage.setItem("accessTokenExpiration", expiration);
        },

        loadToken: function () {
            var accessToken = window.localStorage.getItem("accessToken"),
                expiration = window.localStorage.getItem("accessTokenExpiration");
            this.set("accessToken", accessToken);
            this.set("accessTokenExpiration", expiration);
        },

        deleteToken: function () {
            window.localStorage.removeItem("accessToken");
            window.localStorage.removeItem("accessTokenExpiration");
        },

        now: function () {
            return Math.round(new Date().getTime() / 1000);
        },

        uuid: function () {
            var template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
            return template.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === "x" ? r : r & 3 | 8;
                return v.toString(16);
            });
        }
    });

});
define('yith-library-mobile-client/utils/prefix-event', ['exports'], function (exports) {

    'use strict';

    exports['default'] = prefixEvent;
    function prefixEvent(event) {
        var vendorPrefixes = ["webkit", "moz", "MS", "o", ""];
        var prefixedEventNames = vendorPrefixes.map(function (prefix) {
            return prefix ? prefix + event : event.toLowerCase();
        });
        return prefixedEventNames.join(" ");
    }

});
define('yith-library-mobile-client/utils/settings', ['exports', 'ember', 'yith-library-mobile-client/config/environment'], function (exports, Ember, ENV) {

    'use strict';

    exports['default'] = Ember['default'].Object.extend({

        defaults: {
            serverBaseUrl: ENV['default'].defaults.serverBaseUrl
        },

        getSetting: function (name) {
            var setting = window.localStorage.getItem(name);
            if (setting === null) {
                return this.defaults[name] || null;
            } else {
                return JSON.parse(setting);
            }
        },

        setSetting: function (name, value) {
            var serialized = JSON.stringify(value);
            return window.localStorage.setItem(name, serialized);
        },

        deleteSetting: function (name) {
            window.localStorage.removeItem(name);
        }

    });

});
define('yith-library-mobile-client/utils/snake-case-to-camel-case', ['exports'], function (exports) {

    'use strict';

    exports['default'] = snakeCaseToCamelCase;
    function snakeCaseToCamelCase(symbol) {
        return symbol.split("_").filter(function (word) {
            return word !== "";
        }).map(function (word, idx) {
            if (idx === 0) {
                return word;
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
        }).join("");
    }

});
define('yith-library-mobile-client/utils/syncmanager', ['exports', 'ember', 'yith-library-mobile-client/utils/snake-case-to-camel-case'], function (exports, Ember, snakeCaseToCamelCase) {

    'use strict';

    exports['default'] = Ember['default'].Object.extend({

        fetchUserInfo: function (accessToken, serverBaseUrl, clientId) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve /*, reject */) {
                Ember['default'].$.ajax({
                    url: serverBaseUrl + "/user?client_id=" + clientId,
                    type: "GET",
                    crossDomain: true,
                    headers: {
                        Authorization: "Bearer " + accessToken
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
        convertRecord: function (record) {
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

        updateAccountStore: function (rawData) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve /*, reject */) {
                var data = self.convertRecord(rawData);
                self.store.findById("account", data.id).then(function (existingRecord) {
                    // update account
                    existingRecord.set("email", data.email);
                    existingRecord.set("firstName", data.firstName);
                    existingRecord.set("lastName", data.lastName);
                    existingRecord.set("screenName", data.screenName);
                    resolve(existingRecord);
                }, function () {
                    // create account
                    // because we try to find it, it is already in the store
                    // but the record is empty.
                    var newRecord = self.store.recordForId("account", data.id);
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

        fetchSecrets: function (accessToken, serverBaseUrl, clientId) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve /*, reject */) {
                Ember['default'].$.ajax({
                    url: serverBaseUrl + "/passwords?client_id=" + clientId,
                    type: "GET",
                    crossDomain: true,
                    headers: {
                        Authorization: "Bearer " + accessToken
                    }
                }).done(function (data /*, textStatus, jqXHR*/) {
                    resolve(data);
                });
            }).then(function (data) {
                return self.updateSecretsStore(data);
            });
        },

        updateSecretsStore: function (data) {
            var self = this,
                promises = {
                secrets: this.store.find("secret"),
                tags: this.store.find("tag")
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

        updateSecrets: function (existingRecords, passwords) {
            var self = this,
                result = [];
            passwords.forEach(function (password) {
                var existingRecord = existingRecords.findBy("id", password.id);
                if (existingRecord !== undefined) {
                    result.push(self.updateSecret(existingRecord, password));
                } else {
                    result.push(self.createSecret(password));
                }
            });
            return result;
        },

        createSecret: function (data) {
            return this.store.createRecord("secret", {
                id: data.id,
                service: data.service,
                account: data.account,
                secret: data.secret,
                notes: data.notes,
                tags: data.tags.join(" ")
            }).save();
        },

        updateSecret: function (record, data) {
            record.set("service", data.service);
            record.set("account", data.account);
            record.set("secret", data.secret);
            record.set("notes", data.notes);
            record.set("tags", data.tags.join(" "));
            return record.save();
        },

        updateTags: function (existingRecords, passwords) {
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
                var existingRecord = existingRecords.findBy("name", name);
                if (existingRecord !== undefined) {
                    result.push(self.updateTag(existingRecord, name, count));
                } else {
                    result.push(self.createTag(name, count));
                }
            });
            return result;
        },

        createTag: function (name, count) {
            return this.store.createRecord("tag", {
                name: name,
                count: count
            }).save();
        },

        updateTag: function (record, name, count) {
            record.set("name", name);
            record.set("count", count);
            return record.save();
        },

        deleteAccount: function () {
            var promises = [];
            this.store.all("secret").forEach(function (secret) {
                promises.push(secret.destroyRecord());
            }, this);
            this.store.all("tag").forEach(function (tag) {
                promises.push(tag.destroyRecord());
            }, this);
            this.store.all("account").forEach(function (account) {
                promises.push(account.destroyRecord());
            }, this);

            return Ember['default'].RSVP.all(promises);
        }

    });

});
define('yith-library-mobile-client/views/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNames: ["full-height"]
    });

});
define('yith-library-mobile-client/views/secret-revealer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        templateName: "secret-revealer",
        tagName: "form",
        classNames: ["secret-revealer"],
        attributeBindings: ["autocomplete"],
        autocomplete: "off",
        buttonClass: "recommend",
        buttonText: "Reveal secret",
        decryptedSecret: null,
        encryptedSecret: "",

        click: function (event) {
            var $target = Ember['default'].$(event.target);

            if ($target.is("button")) {
                this.buttonClicked();
            }

            // Don't bubble up any more events
            return false;
        },

        buttonClicked: function () {
            var $masterPasswordInput = null,
                masterPasswordValue = null,
                secret = "";

            if (this.get("decryptedSecret") !== null) {
                this.hideSecret();
            } else {
                $masterPasswordInput = this.$("input[type=password]");
                masterPasswordValue = $masterPasswordInput.val();
                $masterPasswordInput.val("");
                secret = this.get("encryptedSecret");
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

            this.set("buttonText", "Reveal secret");
            this.set("buttonClass", "recommend");
            this.set("decryptedSecret", null);
        },

        badMasterPassword: function () {
            this.set("buttonText", "Wrong master password, try again");
            this.set("buttonClass", "danger");
            this.$("input[type=password]").focus();
        },

        revealSecret: function (secret) {
            this.set("buttonText", "Hide secret");
            this.set("buttonClass", "recommend");
            this.set("decryptedSecret", secret);

            Ember['default'].run.scheduleOnce("afterRender", this, function () {
                this.$("input[type=text]").focus().select();
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
            var $timer = this.$("svg"),
                width = $timer.width(),
                width2 = width / 2,
                radius = width * 0.45,
                now = new Date(),
                elapsed = (now - this.start) / 1000,
                completion = elapsed / this.totalTime,
                endAngle = 360 * completion,
                endPoint = this.polarToCartesian(width2, width2, radius, endAngle),
                arcSweep = endAngle <= 180 ? "1" : "0",
                d = ["M", width2, width2 - radius, "A", radius, radius, 0, arcSweep, 0, endPoint.x, endPoint.y, "L", width2, width2, "Z"].join(" ");

            this.$("path").attr("d", d);

            // If completion is 100% hide the secret
            if (completion >= 1) {
                this.hideSecret();
            } else {
                this.timer = window.requestAnimationFrame(this.tick.bind(this));
            }
        },

        polarToCartesian: function (x, y, radius, degrees) {
            var radians = (degrees - 90) * Math.PI / 180;
            return {
                x: x + radius * Math.cos(radians),
                y: y + radius * Math.sin(radians)
            };
        },

        didInsertElement: function () {
            this.$("input").focus();
        },

        willDestroy: function () {
            this.hideSecret();
        }
    });

});
define('yith-library-mobile-client/views/secrets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNames: ["full-height"],

        didInsertElement: function () {
            window.addEventListener("offline", this);
            window.addEventListener("online", this);
        },

        handleEvent: function (event) {
            switch (event.type) {
                case "offline":
                    this.get("controller").send("offline");
                    break;
                case "online":
                    this.get("controller").send("online");
                    break;
            }
        },

        willDestroy: function () {
            window.removeEventListener("offline", this);
            window.removeEventListener("online", this);
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