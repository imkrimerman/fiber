/**
 * Fiber Binder Extension
 * @var {Object}
 */
var $Binder = {

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
    if (_.isString(methods) && methods === 'all') methods = _.functionsIn(this);
    if (! _.isArray(methods)) return;

    for (var i = 0; i < methods.length; i ++)
      if (_.isFunction(this[methods[i]]))
        this[methods[i]] = _.bind(this[methods[i]], this);
  }
};
