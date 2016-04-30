/**
 * Fiber Binder Extension
 * @type {Object.<Fiber.Extension>}
 */
var $Binder = new Fiber.Extension('Binder', {

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initWith: 'applyBinder',

  /**
   * Methods list to bind
   * @type {Array|Function}
   */
  bindMethods: [],

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|Function|string|boolean}
   */
  willExtend: ['bindMethods'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['bindMethods'],

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
});

/**
 * Register Extension
 */
$ioc.extension('Binder', $Binder);
