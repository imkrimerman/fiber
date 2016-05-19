/**
 * Serializable Extension
 * @class
 * @extends {Fiber.Extension}
 */
var $Serializable = new Fiber.Extension('Serializable', {

  /**
   * Serializes class to string.
   * @returns {string}
   */
  serialize: function() {
    return $fn.serialize.stringify(this.attributes);
  },

  /**
   * Sets Model attributes from serialized string.
   * @param {string} serialized
   * @returns {Object}
   */
  fromSerialized: function(serialized) {
    if ($isStr(serialized)) serialized = $fn.serialize.parse(serialized);
    if ($isPlain(serialized)) this.set(serialized);
    return this;
  }
});

/**
 * Adds Serializable Extension to the Fiber Base Class
 */
BaseClass.implementOwn('Serializable').mutate($Serializable.getCode());
