/**
 * Router
 * @class
 */
Fiber.Router = Fiber.fn.class.make(Backbone.Router, [
  'NsEvents', 'Extend', 'OwnProps', 'Access', 'Mixin', {

    /**
     * Route collections
     * @type {Object<Collection>}
     */
    routeCollection: null,

    /**
     * Middleware collection
     * @type {Object<Collection>}
     */
    middlewareCollection: null,

    /**
     * Router history start options
     * @type {Object}
     */
    startOptions: {
//      pushState: true
    },

    /**
     * Current route
     * @type {Route|null}
     */
    currentRoute: null,

    /**
     * Viewport
     * @type {Viewport}
     */
    viewport: null,

    /**
     * Events namespace
     * @var {string}
     */
    eventsNs: 'router',

    /**
     * Event catalog
     * @var {Object}
     */
    eventsCatalog: {
      start: 'start',
      started: 'started',
      load: 'load',
      loaded: 'loaded',
      notAllowed: 'not:allowed'
    },

    /**
     * Properties keys that will be auto extended from initialize object
     * @var {Array|Function|string}
     */
    extendable: ['routeCollection', 'middlewareCollection', 'startOptions'],

    /**
     * Router constructor
     * @param options
     */
    constructor: function(options) {
      this.options = options;
      this.viewport = new Fiber.Viewport();
      _.defaults(options, { routes: {}, middleware: {} });
      this.applyExtend(options);
      this.applyOwnProps();
      this.createRouteCollection(options.routes);
      this.createMiddlewareCollection(options.middleware);
      this.attachRoutes();
      this.initialize.apply(this, options);
    },

    /**
     * Attaches collection of routes
     * @return {Fiber.Router}
     */
    attachRoutes: function() {
      this.routeCollection.each(this.attachRoute, this);
      return this;
    },

    /**
     * Starts backbone history
     * @returns {Router}
     */
    start: function() {
      var options = _.result(this, 'startOptions', {});
      this.fire('start', options, this, Backbone.history);
      Backbone.history.start(options);
      this.fire('started', options, this, Backbone.history);
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
      var route      = route()
        , page    = route.get('page')
        , middleware = this.getMiddleware(route)
        , isAllowed  = this.passThrough(middleware, route);

      if (! isAllowed) {
        this.fire('notAllowed', route, middleware, this);
        return false;
      }

      this.currentRoute = route;

      if (page instanceof Fiber.Page) this.viewport.show(page, route);
      else return false;
    },

    /**
     * Goes to the url by alias
     * @param {String} alias
     * @returns {*}
     */
    go: function(alias) {
      var route = this.routeCollection.findWhere({ alias: alias });
      if (! route) return;
      var url = route.get('url');
      if (_.isArray(url)) url = _.first(url);
      return this.navigate(url, { trigger: true });
    },

    /**
     * Passes route through all attached middleware to it
     * @param {Array} middleware
     * @param {Route} route
     * @returns {boolean}
     */
    passThrough: function(middleware, route) {
      return _.every(middleware, function(oneMiddleware) {
        return oneMiddleware.passThrough(route);
      });
    },

    /**
     * Returns middleware for route
     * @param {Route} route
     * @returns {Array}
     */
    getMiddleware: function(route) {
      var needToPass = route.get('middleware');
      return this.middlewareCollection.filter(function(middleware) {
        return _.contains(needToPass, middleware.get('alias'));
      });
    },

    /**
     * Attaches one Route
     * @param {Object.<Fiber.Route>} route
     * @returns {*}
     */
    attachRoute: function(route) {
      var url = route.get('url');
      if (_.isArray(url)) for (var i = 0; i < url.length; i ++)
        this.route(url[i], route.get('alias'), _.constant(route));
      else
        this.route(url, route.get('alias'), _.constant(route));
      return this;
    },

    /**
     * Prepares routes object
     * @param {Object} routes
     * @returns {Object}
     */
    prepareRoutes: function(routes) {
      for (var alias in routes)
        if (! _.has(routes[alias], 'alias')) routes[alias].alias = alias;
      return routes;
    },

    /**
     * Prepares middleware object
     * @param {Object} middleware
     * @returns {Object}
     */
    prepareMiddleware: function(middleware) {
      for (var alias in middleware) {
        if (_.isFunction(middleware[alias])) middleware[alias] = { handler: middleware[alias] };
        if (! _.has(middleware[alias], 'alias')) middleware[alias].alias = alias;
      }
      return middleware;
    },

    /**
     * Creates Route Collection from routes object
     * @param [{Object|Array}] routes
     * @returns {Collection}
     */
    createRouteCollection: function(routes) {
      return this.createCollection(
        'routeCollection',
        Fiber.Collection,
        this.prepareRoutes(routes),
        { model: Fiber.Route }
      );
    },

    /**
     * Creates middleware collection
     * @param {Object|Array} middleware
     * @returns {*}
     */
    createMiddlewareCollection: function(middleware) {
      return this.createCollection(
        'middlewareCollection',
        Fiber.Collection,
        this.prepareMiddleware(middleware),
        { model: Fiber.Middleware }
      );
    },

    /**
     * Creates collection
     * @param {String} collectionKey
     * @param {Collection|Function} CollectionClass
     * @param {Object|Array} models
     * @param [{Object}] options
     * @returns {Object<Collection>}
     */
    createCollection: function(collectionKey, CollectionClass, models, options) {
      if (this[collectionKey] instanceof CollectionClass) return this[collectionKey];
      models = models || [];
      if (_.isPlainObject(models)) models = _.values(models);
      if (! _.isArray(models)) models = [];
      return this[collectionKey] = new CollectionClass(models, options);
    },
  }
]);
