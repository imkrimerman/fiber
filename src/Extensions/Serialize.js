/**
 * Serialize Extension
 * @class
 * @extends {Fiber.Extension}
 */
var $Serialize = new Fiber.Extension('Serialize', {

  /**
   * Serializes class to string.
   * @returns {string}
   */
  serialize: function() {
    return $fn.serialize(this.attributes);
  },

  /**
   * Sets Model attributes from serialized string.
   * @param {string} serialized
   * @returns {Object}
   */
  fromSerialized: function(serialized) {
    if (_.isString(serialized)) serialized = $fn.unserialize(serialized);
    if (_.isPlainObject(serialized)) this.set(serialized);
    return this;
  }
});

/**
 * Adds serialization to the Fiber Base Class
 */
BaseClass.mutate($Serialize.getCode()).implementOwn('Serialize');
