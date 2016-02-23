Fiber.Extensions.Binder = {

  /**
   * Methods list to bind
   * @var {Array|Function}
   */
  bindMethods: [],

  /**
   * Binds methods to this
   */
  applyBinder: function() {
    var methods = _.result(this, 'bindMethods');
    if (methods === Infinity) methods =  _.functionsIn(this);
    if (! _.isArray(methods)) return;

    for (var i = 0; i < methods.length; i ++)
      if (_.isFunction(this[methods[i]]))
        this[methods[i]] = _.bind(this[methods[i]], this);
  }
};
