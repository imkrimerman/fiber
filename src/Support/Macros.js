/**
 * Macros holder
 * @type {Object}
 */
Fiber.fn.macros = {

  /**
   * Macros storage
   * @type {Object}
   */
  _storage: {
    arrayFirstOrAll: function(object) {
      return function(result) {
        return _.isArray(object) ? result : _.first(result);
      };
    },
    constant: function(object) {
      return $fn.constant(object);
    },
    'get/set': function(property, checkToSetFn) {
      return {
        get: function() {
          return this[property];
        },
        set: function(value) {
          if (_.isString(checkToSetFn) && _.isFunction($fn.get(this, checkToSetFn))) checkToSetFn = this[checkToSetFn];
          if ((_.isFunction(checkToSetFn) && checkToSetFn(value)) || ! $isDef(checkToSetFn)) {
            this[property] = value;
          }
        }
      };
    }
  },

  /**
   * Returns macros by name or defaults if one is not found.
   * @param {string} name
   * @param {*} [defaults]
   * @returns {function()|*}
   */
  get: function(name, defaults) {
    return $fn.macros._storage[name] || defaults;
  },

  /**
   * Sets macros by name
   * @param {string} name
   * @param {function()} macrosCreator
   * @returns {Object}
   */
  set: function(name, macrosCreator) {
    $fn.macros._storage[name] = macrosCreator;
    return $fn.macros;
  },

  /**
   * Determines if macros has already registered
   * @param {string} name
   * @returns {boolean}
   */
  has: function(name) {
    return !! $fn.macros._storage[name];
  },

  /**
   * Creates macros by name using given args
   * @param {string} name
   * @param {?Array} args
   * @returns {*}
   */
  create: function(name, args) {
    return $fn.applyFn($fn.macros.get(name, $fn.constant), $fn.castArr(args));
  },

  /**
   * Includes macros mixin
   * @param {Object|function()} macrosMixin
   * @param {?boolean} [override=false]
   * @returns {*|Object|Fiber.fn.class}
   */
  include: function(macrosMixin, override) {
    return $fn.class.include($fn.macros._storage, macrosMixin, override);
  },

  /**
   * Returns all macros storage.
   * @returns {Object}
   */
  all: function() {
    return $fn.clone($fn.macros._storage);
  },
};
