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
   * @type {Array|function(...)}
   */
  ownProps: [],

  /**
   * Ensures that class owns properties
   * @param {?Array} [properties]
   * @param {?boolean} [merge=true]
   * @returns {Object}
   */
  applyOwnProps: function(properties) {
    var own = $fn.result(this, 'ownProps', []);
    if (own === 'all' || own) own = $fn.properties(this);
    if (_.isArray(own)) properties = $fn.concat(own, $fn.compact($fn.castArr(properties)));
    return $fn.class.ensureOwn(this, properties);
  }
});

/**
 * Register Extension
 */
$Ioc.extension('OwnProps', $OwnProps);
