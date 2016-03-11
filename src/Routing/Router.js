Fiber.Router = Fiber.fn.class.createFullMixinClass([
  _.omit(Backbone.Router.prototype, ['routes', '_bindRoutes']), {

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
     * Router history
     * @var {Object.<Fiber.HistoryCollection>}
     */
    history: null,

    /**
     * Collections list
     * @var {Object|Function}
     */
    collections: {
      routes: Fiber.RouteCollection,
      middleware: Fiber.MiddlewareCollection,
      history: Fiber.HistoryCollection
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
      this.bindRoutes();
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
          , data = this.prepareCollectionData(options[collectionKey]);
        this[collectionKey] = new Collection(data, { router: this });
      }
      return this;
    },

    /**
     * Binds routes to the Router
     * @return {Fiber.Router}
     */
    bindRoutes: function() {
      this.routes.bind();
      return this;
    },

    /**
     * Executes route
     * @param {Function} route
     * @param {Array} args
     * @param {string} alias
     * @returns {void|boolean}
     */
    execute: function(route, args) {
      var route = route()
        , handler = route.get('handler');

      if (! this.middleware.pass(route)) {
        this.fire('not:allowed', route, this);
        return false;
      }

      var current = {route: route, args: args};

      this.setCurrent(current);
      this.history.add(current);

      if (handler) handler.apply(this, args);
      else return false;
    },

    /**
     * Goes to the url by alias
     * @param {string} alias
     * @returns {*}
     */
    go: function(alias, options) {
      var route = this.routes.getByAlias(alias);
      if (! route) return;
      return this.navigate(route.get('url'), _.defaults({}, options || {}, {
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
