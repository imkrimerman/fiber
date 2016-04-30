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
   * @param {?Array|Function} [props]
   * @param {?boolean} [merge=true]
   * @returns {Object}
   */
  applyOwnProps: function(properties, merge) {
    merge = $val(merge, true, _.isBoolean);
    var ownProperties = _.result(this, 'ownProps', [])
      , properties = $val(properties, [], _.isArray);
    if (merge) properties = $fn.concat(ownProperties, properties);
    for (var i = 0; i < properties.length; i ++) {
      var property = properties[i]
        , propertyValue = _.get(this, property);
      if (this.hasOwnProperty(property)) continue;
      _.set(this, property, $fn.clone(propertyValue, true));
    }
    return this;
  }
});

/**
 * Register Extension
 */
$ioc.extension('OwnProps', $OwnProps);
