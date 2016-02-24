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
    return _.get(this, property, defaults);
  },

  /**
   * Sets `value` by given `property` key
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(property, value) {
    _.set(this, property, value);
    return this;
  },

  /**
   * Determine if Class has given `property`
   * @param {string} property
   * @returns {boolean}
   */
  has: function(property) {
    return _.has(this, property);
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
    return _.result(this, property, defaults);
  },

  /**
   * Removes `value` by given `property` key
   * @param {string} property
   * @returns {*}
   */
  forget: function(property) {
    _.unset(this, property);
    return this;
  }
};
