Fiber.RouteCollection = Fiber.RouterCollection.extend({

  /**
   * Default collection model
   * @var {Fiber.Route}
   */
  model: Fiber.Route,

  /**
   * Methods list to bind
   * @var {Array|Function}
   */
  bindMethods: ['wrap', 'attachOne'],

  /**
   * Attaches routes to current router
   * @returns {Fiber.RouteCollection}
   */
  attach: function() {
    this.each(this.attachOne);
    return this;
  },

  /**
   * Attaches one route to the current router
   * @param {Object.<Fiber.Route>} route
   * @returns {*}
   */
  attachOne: function(route) {
    return this.router.route(route.get('url'), route.get('alias'), this.wrap(route))
  },

  /**
   * Creates function wrapper that will return route model when invoked
   * @param {Object.<Fiber.Route>} route
   * @returns {Function}
   */
  wrap: function(route) {
    return _.constant(route);
  },

});
