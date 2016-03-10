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
  bindMethods: ['wrap', 'bind', 'bindOne'],

  /**
   * Returns route by alias
   * @param {string} alias
   * @returns {Object.<Fiber.Route>|null}
   */
  getByAlias: function(alias) {
    return this.findWhere({ alias: alias });
  },

  /**
   * Binds routes to current router
   * @returns {Fiber.RouteCollection}
   */
  bind: function() {
    this.each(this.bindOne);
    return this;
  },

  /**
   * Binds one route to the current router
   * @param {Object.<Fiber.Route>} route
   * @returns {*}
   */
  bindOne: function(route) {
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
