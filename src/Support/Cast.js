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
  toArray: function(value, wrap) {
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
  toPlain: function(value) {
    if (_.isPlainObject(value)) return value;
    if (! _.isObject(value) || _.isArray(value)) return {};
    if (_.isFunction(value) && ! $fn.class.isClass(value)) {
      var tryVal = value();
      if (_.isPlainObject(value)) return tryVal;
    }
    return {};
  },

  /**
   * Casts value to object
   * @param value
   * @returns {*}
   */
  toObject: function(value) {
    if (! _.isObject(value)) return {};
    return value;
  },

  /**
   * Casts value to function
   * @param value
   * @returns {*}
   */
  toFunction: function(value) {
    if (! _.isFunction(value)) return _.constant(value);
    return value;
  },

  /**
   * Casts value to string
   * @param value
   * @returns {string}
   */
  toString: function(value) {
    return _.toString(value);
  },

  /**
   * Casts value to number
   * @param value
   * @returns {number}
   */
  toNumber: function(value) {
    return _.toNumber(value);
  },

  /**
   * Casts value to integer
   * @param value
   * @returns {number}
   */
  toInteger: function(value) {
    return _.toInteger(value);
  },

  /**
   * Casts value to boolean
   * @param value
   * @returns {boolean}
   */
  toBoolean: function(value) {
    return !! value;
  }
};
