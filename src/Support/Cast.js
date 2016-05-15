/**
 * Cast support
 * @type {Object}
 */
Fiber.fn.cast = {

  /**
   * Casts value to array
   * @param {*} value
   * @returns {Array}
   */
  toArray: function(value) {
    return _.toArray(value);
  },

  /**
   * Casts value to plain object
   * @param {*} value
   * @param {boolean} [force=false]
   * @returns {Object}
   */
  toPlain: function(value, force) {
    force = _.isBoolean(force) ? force : false;
    if (_.isPlainObject(value)) return value;
    if (_.isArray(value) && force) return _.zipObject($fn.fill(value.length), value);
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
    if (! _.isFunction(value)) return $fn.constant(value);
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
    return ! ! value;
  }
};

/**
 * Adds `toBool` alias
 */
$fn.class.alias($fn.cast, 'toBoolean', 'toBool');
