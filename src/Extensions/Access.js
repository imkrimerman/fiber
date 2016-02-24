/**
 * Access extension brings getters, setters and unsetters that uses
 * `lodash` methods to support deep access to the Class.
 * @var {Object}
 */
Fiber.Extensions.Access = {

  /**
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided that defaults will be set to `null`
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: function(property, defaults) {
    return Fiber.fn.get(this, property, defaults);
  },

  /**
   * Sets `value` by given `property` key
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(property, value) {
    Fiber.fn.set(this, property, value);
    return this;
  },

  /**
   * Determine if Class has given `property`
   * @param {string} property
   * @returns {boolean}
   */
  has: function(property) {
    return Fiber.fn.has(this, property);
  },

  /**
   * Gets value by given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: function(property, defaults) {
    return Fiber.fn.result(this, property, defaults);
  },

  /**
   * Removes `value` by given `property` key
   * @param {string} property
   * @returns {*}
   */
  forget: function(property) {
    Fiber.fn.forget(this, property);
    return this;
  }
};
