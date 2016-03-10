var RouterPrototype = Backbone.Router.prototype;

_.unset(RouterPrototype, 'routes');
_.unset(RouterPrototype, '_bindRoutes');

Fiber.Router = Fiber.fn.class.createFullMixinClass([
  RouterPrototype, {

    /**
     * Routes collection
     * @var {Object.<Fiber.RouteCollection>}
     */
    routes: null,

    /**
     * Middleware collection
     * @var {Object.<Fiber.MiddlewareCollection>}
     */
    middleware: null,

    /**
     * Collections list
     * @var {Object|Function}
     */
    collections: {
      routes: Fiber.RouteCollection,
      middleware: Fiber.MiddlewareCollection
    },

    /**
     * Current router state
     * @var {Object}
     */
    current: {
      route: null,
      args: null
    },

    /**
     * Constructs Router
     * @param {?Object} [options={}]
     */
    constructor: function(options) {
      options = val(options, {}, _.isPlainObject);
      this.options = options;
      this.applyExtend(options);
      this.applyOwnProps();
      this.applyBinder();
      this.createCollections(options);
      this.attachRoutes();
      this.initialize.apply(this, arguments);
    },

    /**
     * Creates Collections
     * @param {?Object} [options={}]
     * @return {Fiber.Router}
     */
    createCollections: function(options) {
      options = val(options, {}, _.isPlainObject);
      for (var collectionKey in this.collections) {
        var Collection = this.collections[collectionKey]
          , data = this.prepareCollectionData(options[collectionKey])
        this[collectionKey] = new Collection(data, { router: this });
      }
      return this;
    },

    /**
     * Attaches routes
     * @return {Fiber.Router}
     */
    attachRoutes: function() {
      this.routes.attach();
      return this;
    },

    /**
     * Executes route
     * @param {Function} route
     * @param {Array} args
     * @param {String} alias
     * @returns {void|boolean}
     */
    execute: function(route, args) {
      var route = route()
        , handler = route.get('handler');

      if (! this.middleware.passThrough(route)) {
        this.fire('not:allowed', route, this);
        return false;
      }

      this.setCurrent({route: route, args: args});

      if (handler) handler.apply(this, args);
      else return false;
    },

    /**
     * Goes to the url by alias
     * @param {String} alias
     * @returns {*}
     */
    go: function(alias, options) {
      var route = this.collections.routes.findWhere({ alias: alias });
      if (! route) return;
      options = _.defaults({}, options || {}, { trigger: true, replace: true });
      return this.navigate(route.get('url'), options);
    },

    /**
     * Sets current router state
     * @param {Object} current
     * @returns {Fiber.Router}
     */
    setCurrent: function(current) {
      this.current = current;
      return this;
    },

    /**
     * Returns current router state
     * @returns {Object}
     */
    getCurrent: function() {
      return this.current;
    },

    /**
     * Determines if router has current state object
     * @returns {boolean}
     */
    hasCurrent: function() {
      return ! _.isEmpty(this.current);
    },

    /**
     * Sets given `route` as current
     * @param {Object.<Fiber.Route>} route
     * @returns {Fiber.Router}
     */
    setCurrentRoute: function(route) {
      this.current.route = route;
      return this;
    },

    /**
     * Returns current route
     * @returns {Object.<Fiber.Route>|null}
     */
    getCurrentRoute: function() {
      return this.current.route;
    },

    /**
     * Determines if router has current route
     * @returns {boolean}
     */
    hasCurrentRoute: function() {
      return ! _.isEmpty(this.current.route);
    },

    /**
     * Sets given `args` as current route arguments
     * @param {Array|*} args
     * @returns {Fiber.Router}
     */
    setCurrentArgs: function(args) {
      this.current.args = args;
      return this;
    },

    /**
     * Returns current route arguments
     * @returns {Object.<Fiber.Route>|null}
     */
    getCurrentArgs: function() {
      return this.current.args;
    },

    /**
     * Determines if router has current route arguments
     * @returns {boolean}
     */
    hasCurrentArgs: function() {
      return ! _.isEmpty(this.current.args);
    },

    /**
     * Prepares collection data
     * @param {Array|Object} data
     * @returns {Array}
     */
    prepareCollectionData: function(data) {
      if (_.isEmpty(data)) return [];
      if (_.isPlainObject(data)) {
        for (var alias in data) {
          var route = data[alias];
          if (_.has(route, 'alias')) continue;
          route[alias].alias = alias;
        }
        data = _.values(data);
      }
      return data;
    },

  }
]);
