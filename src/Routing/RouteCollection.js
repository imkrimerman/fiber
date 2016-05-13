/**
 * Fiber Route Collection
 * @class
 * @extends {RouterCollection}
 */
Fiber.RouteCollection = RouterCollection.extend({

  /**
   * Default collection model
   * @type {Fiber.Route}
   */
  model: Fiber.Route,

  /**
   * Methods list to bind
   * @type {Array|function()}
   */
  bindMethods: ['wrap', 'bind', 'bindOne'],

  /**
   * Sets models to the collection
   * @param {Array|Object.<Fiber.Model>} models
   * @param {?Object} [options={}]
   */
  set: function(models, options) {
    options = $val(options, {});
    var prepared = [];

    if (! options.remove) {
      models = $fn.castArr(models);

      for (var i = 0; i < models.length; i ++) {
        var model = models[i];

        if (! _.isArray(model.url)) prepared.push(model);
        else for (var j = 0; j < model.url.length; j ++) {
          var url = model.url[j]
            , clone = _.clone(model);

          clone.url = url;
          prepared.push(clone);
        }
      }
    }
    else prepared = models;

    this.$super('set', [prepared, options]);
  },

  /**
   * Returns route by alias
   * @param {string} alias
   * @returns {Object.<Fiber.Route>|null}
   */
  getByAlias: function(alias) {
    return this.findWhere({alias: alias});
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
   * Binds routes to the given Router
   * @param {Object.<Fiber.Router>} router
   * @return {Fiber.RouteCollection}
   */
  bindTo: function(router) {
    this.setRouter(router);
    return this.bind();
  },

  /**
   * Creates function wrapper that will return route model when invoked
   * @param {Object.<Fiber.Route>} route
   * @returns {function()}
   */
  wrap: function(route) {
    return $fn.constant(route);
  },

});
