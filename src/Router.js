/**
 * Router options to auto merge
 * @type {Array.<String>}
 */
var routerOptions = ['routeCollection', 'middlewareCollection', 'startOptions'];

/**
 * Router
 * @class
 */
Fiber.Router = Fiber.fn.class.make(Backbone.Router, ['NsEvents', {

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
   * Ready state
   * @type {boolean}
   */
  state: false,

  /**
   * Viewport
   * @type {Viewport}
   */
  viewport: null,

  /**
   * Events configuration object
   * @type {Object}
   */
  eventsConfig: {
    // Event namespace
    ns: 'router',
    // Event catalog
    catalog: {
      load: 'load',
      loaded: 'loaded',
      notAllowed: 'not:allowed'
    }
  },

  /**
   * Router constructor
   * @param options
   */
  constructor: function(options) {
    this.state = false;
    this.viewport = new Viewport();
    _.defaults(options, {routes: [], middleware: []});
    _.assign(this, _.pick(options, routerOptions));
    this.createRouteCollection(options.routes);
    this.createMiddlewareCollection(options.middleware);
    this.attachRoutes();
    this.initialize.apply(this, options);
  },

  /**
   * Starts backbone history
   * @returns {Router}
   */
  start: function() {
    Backbone.history.start(_.result(this, 'startOptions', {}));
    Global('subscribe', this, 'userSignedIn', this.whenSignedIn.bind(this));
    return this;
  },

  /**
   * When user has signed in
   */
  whenSignedIn: function() {
    this.go('stories');
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
      , handler = route.get('handler')
      , middleware = this.getMiddleware(route)
      , isAllowed = this.passThrough(middleware, route);

    if (! isAllowed) {
      this.fire('notAllowed', {route: route, middleware: middleware});
      return false;
    }

    this.currentRoute = route;

    if (handler instanceof Page) this.viewport.show(handler, route.get('layout'));
    else if (handler) handler.apply(this, args);
    else return false;
  },

  /**
   * Goes to the url by alias
   * @param {String} alias
   * @returns {*}
   */
  go: function(alias) {
    var route = this.routeCollection.findWhere({alias: alias});
    if (! route) return;
    var url = route.get('url');
    if (_.isArray(url)) url = _.first(url);
    return this.navigate(url, {trigger: true});
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
   * Attaches routes
   * @return {Router}
   */
  attachRoutes: function() {
    this.fire('load', this);
    Support.requireQueue(
      this.routeCollection.pluck('page'),
      this.onPagesLoaded.bind(this)
    );
    return this;
  },

  /**
   * On pages loaded
   * @param {Object} loaded
   */
  onPagesLoaded: function(loaded) {
    this.routeCollection.each(function(route) {
      route.set('handler', loaded[route.get('page')]);
      this.attachRoute(route);
    }, this);
    this.state = true;
    this.fire('loaded', this);
  },

  /**
   * Attaches one Route
   * @param {Route} route
   * @returns {*}
   */
  attachRoute: function(route) {
    var url = route.get('url');
    if (_.isArray(url)) for (var i = 0; i < url.length; i ++)
      this.route(url[i], route.get('alias'), _.constant(route));
    else
      this.route(url, route.get('alias'), _.constant(route));
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
      if (_.isFunction(middleware[alias])) middleware[alias] = {handler: middleware[alias]};
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
      Collection,
      this.prepareRoutes(routes),
      {model: Route}
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
      Collection,
      this.prepareMiddleware(middleware),
      {model: Middleware}
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
}]);
