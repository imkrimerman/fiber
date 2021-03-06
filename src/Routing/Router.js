Fiber.Router = Fiber.Object.extend([
  _.omit(Backbone.Router.prototype, ['routes', '_bindRoutes']), {

    /**
     * Routes collection
     * @type {Object.<Fiber.RouteCollection>}
     */
    routes: null,

    /**
     * Middleware collection
     * @type {Object.<Fiber.MiddlewareCollection>}
     */
    middleware: null,

    /**
     * Router history
     * @type {Object.<Fiber.HistoryCollection>}
     */
    history: null,

    /**
     * Collections list
     * @type {Object|Function}
     */
    collections: {
      routes: Fiber.RouteCollection,
      middleware: Fiber.MiddlewareCollection,
      history: Fiber.HistoryCollection
    },

    /**
     * Current route history model
     * @type {Object.<Fiber.HistoryItem>}
     */
    current: new Fiber.HistoryItem,

    /**
     * Constructs Router
     * @param {?Object} [options={}]
     */
    constructor: function(options) {
      options = $fn.class.handleOptions(this, options);
      $fn.extensions.init(this);
      this.createCollections(options);
      this.bindRoutes();
      $fn.apply(this, 'initialize', [arguments]);
    },

    /**
     * Creates Collections
     * @param {?Object} [options={}]
     * @return {Fiber.Router}
     */
    createCollections: function(options) {
      options = $val(options, {}, _.isPlainObject);
      for (var collectionKey in this.collections) {
        var Collection = this.collections[collectionKey]
          , data = this.prepareCollectionData(options[collectionKey]);
        this[collectionKey] = new Collection(data);
      }
      return this;
    },

    /**
     * Binds routes to the Router
     * @return {Fiber.Router}
     */
    bindRoutes: function() {
      this.routes.bindTo(this);
      return this;
    },

    /**
     * Executes route with the provided parameters. This is an
     * excellent place to do pre-route setup or post-route cleanup.
     * @param {Function} route
     * @param {Array} args
     * @returns {boolean}
     */
    execute: function(route, args) {
      var params = [route, args], result = true;
      $fn.fireCallCyclic(this, 'execute', function() {
        if (! this.executeRoute.apply(this, arguments)) result = false;
      }, {fire: params, call: params, callback: arguments});
      return result;
    },

    /**
     * Executes route
     * @param {Function} route
     * @param {Array} args
     * @param {string} alias
     * @returns {boolean}
     */
    executeRoute: function(route, args) {
      var route = route();

      if (! this.middleware.pass(route)) {
        this.fire('not:allowed', route, this);
        return false;
      }

      var handler = route.get('handler')();
      if (! handler) return false;

      this.setCurrent(this.history.add({route: route, args: args}));
      this.fire('execute', handler, route, args, this);
      return true;
    },

    /**
     * Goes to the url by alias
     * @param {string} alias
     * @returns {*}
     */
    go: function(alias, options) {
      var route = this.routes.getByAlias(alias);
      if (route) return this.navigate(route.get('url'), _.defaults({}, options || {}, {
        trigger: true,
        replace: true
      }));
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
          route.alias = alias;
        }
        data = _.values(data);
      }
      return data;
    },

  }
]);

/**
 * Creates reference to the Backbone history
 * @type {Object}
 */
Fiber.history = Backbone.history;
