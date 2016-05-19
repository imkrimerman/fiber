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
   * @type {Array|function(...)}
   */
  bindMethods: [],

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|function(...)|string|boolean}
   */
  willExtend: ['bindMethods'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['bindMethods'],

  /**
   * Binds methods to this
   */
  applyBinder: function() {
    var methods = $result(this, 'bindMethods');
    if (methods === 'all' || _.isBoolean(methods) && methods) methods = $fn.methods(this);
    if (! $isArr(methods)) return;
    for (var i = 0; i < methods.length; i ++)
      if ($isFn(this[methods[i]]))
        this[methods[i]] = $bind(this[methods[i]], this);
  }
});

/**
 * Register Extension
 */
$Ioc.extension('Binder', $Binder);
