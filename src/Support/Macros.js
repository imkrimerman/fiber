/**
 * Macros holder
 * @type {Object}
 */
Fiber.fn.macros = {

  /**
   * Macros storage
   * @type {Object}
   * @private
   */
  _storage: {
    getSet: function(property, checkToSetFn) {
      return {
        get: function() {
          return $fn.get(this, property);
        },
        set: function(value) {
          if (_.isString(checkToSetFn)) checkToSetFn = $fn.get(this, checkToSetFn);
          if (! $isDef(checkToSetFn) || _.isFunction(checkToSetFn) && checkToSetFn(value))
            $fn.set(this, property, value);
          return this;
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
    if (! _.isString(name)) return name;
    return $fn.macros._storage[name] || defaults;
  },

  /**
   * Sets macros by name
   * @param {string} name
   * @param {function()} macrosCreator
   * @returns {Object}
   */
  set: function(name, macrosCreator) {
    if (! _.isString(name)) return macrosCreator;
    $fn.macros._storage[name] = macrosCreator;
    return $fn.macros;
  },

  /**
   * Determines if macros has already registered
   * @param {string} name
   * @returns {boolean}
   */
  has: function(name) {
    if (! _.isString(name)) return false;
    return $fn.cast.toBoolean($fn.macros._storage[name]);
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
