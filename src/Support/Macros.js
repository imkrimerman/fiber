/**
 * Macros holder
 * @type {Object}
 */
Fiber.fn.macros = {

  /**
   * Private configuration
   * @type {Object}
   */
  __private: {

    /**
     * Macros holder
     * @type {Object}
     */
    macros: {
      arrayFirstOrAll: function(object) {
        return function(result) {
          return _.isArray(object) ? result : _.first(result);
        };
      },
      constant: function(object) {
        return function() { return object; };
      },
    }
  },

  /**
   * Returns macros by name or defaults if one is not found.
   * @param {string} name
   * @param {*} [defaults]
   * @returns {Function|*}
   */
  get: function(name, defaults) {
    return $private($fn.macros, $fn.makePrivateKey(name)) || defaults;
  },

  /**
   * Sets macros by name
   * @param {string} name
   * @param {Function} macrosCreator
   * @returns {Object}
   */
  set: function(name, macrosCreator) {
    $private($fn.macros, $fn.makePrivateKey(name), macrosCreator);
    return $fn.macros;
  },

  /**
   * Determines if macros has already registered
   * @param {string} name
   * @returns {boolean}
   */
  has: function(name) {
    return $privateHas($fn.macros, $fn.makePrivateKey(name));
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
   * @param {Object|Function} macrosMixin
   * @param {?boolean} [override=false]
   * @returns {*|Object|Fiber.fn.class}
   */
  include: function(macrosMixin, override) {
    return $fn.class.include($private($fn.macros, $fn.makePrivateKey()), macrosMixin, override);
  },

  /**
   * Returns all macros storage.
   * @returns {Object}
   */
  all: function() {
    return $fn.clone($private($fn.macros, $fn.makePrivateKey()));
  },
};
