/**
 * Fiber Own Properties extension.
 * @type {Object.<Fiber.Extension>}
 */
var $OwnProps = new Fiber.Extension('OwnProps', {

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initWith: 'applyOwnProps',

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: [],

  /**
   * Ensures that class owns properties
   * @param {?Array} [properties]
   * @param {?boolean} [merge=true]
   * @returns {Object}
   */
  applyOwnProps: function(properties, merge) {
    merge = $val(merge, true, _.isBoolean);
    var own = $fn.result(this, 'ownProps', []);
    if (_.isString(own) && own === 'all' || own) own = $fn.properties(this);
    if (merge && _.isArray(own)) properties = $fn.concat(own, $fn.castArr(properties));
    return $fn.class.ensureOwn(this, properties);
  }
});

/**
 * Register Extension
 */
$Ioc.extension('OwnProps', $OwnProps);
