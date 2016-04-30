/**
 * Cast support
 * @type {Object}
 */
Fiber.fn.cast = {

  /**
   * Casts value to array
   * @param {Object} value
   * @returns {Array}
   */
  array: function(value, wrap) {
    if (! value) return [];
    if (_.isArray(value)) return value;
    if (wrap == null || wrap) return [value];
    return _.toArray(value);
  },

  /**
   * Casts value to plain object
   * @param value
   * @returns {Object}
   */
  plain: function(value) {
    if (_.isPlainObject(value)) return value;
    if (! _.isObject(value) || _.isArray(value)) return {};
    if (_.isFunction(value) && ! $fn.class.is(value)) {
      var tryVal = value();
      if (_.isPlainObject(value)) return tryVal;
    }
    return _.toPlainObject(value);
  },

  /**
   * Casts value to object
   * @param value
   * @returns {*}
   */
  object: function(value) {
    if (! _.isObject(value)) return {};
    return value;
  },

  /**
   * Casts value to function
   * @param value
   * @returns {*}
   */
  function: function(value) {
    if (! _.isFunction(value)) return _.constant(value);
    return value;
  },

  /**
   * Casts value to string
   * @param value
   * @returns {string}
   */
  string: function(value) {
    return _.toString(value);
  },

  /**
   * Casts value to number
   * @param value
   * @returns {number}
   */
  number: function(value) {
    return _.toNumber(value);
  },

  /**
   * Casts value to integer
   * @param value
   * @returns {number}
   */
  integer: function(value) {
    return _.toInteger(value);
  },

  /**
   * Casts value to boolean
   * @param value
   * @returns {boolean}
   */
  boolean: function(value) {
    return !! value;
  }
};
