Fiber.MiddlewareCollection = Fiber.RouterCollection.extend({

  /**
   * Default collection model
   * @var {Fiber.Middleware}
   */
  model: Fiber.Middleware,

  /**
   * Returns middleware `for` given route
   * @param {Object.<Fiber.Route>} route
   * @returns {Array}
   */
  getFor: function(route) {
    var needsToPass = route.get('middleware');
    return this.filter(function(middleware) {
      return _.includes(needsToPass, middleware.get('alias'));
    });
  },

  /**
   * Passes route through middleware
   * @param {Object.<Fiber.Route>} route
   * @returns {boolean}
   */
  pass: function(route) {
    var middleware = this.getFor(route);
    return _.every(middleware, function(one) {
      return one.passThrough(route);
    });
  },

});
