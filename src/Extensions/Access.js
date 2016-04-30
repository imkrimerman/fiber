/**
 * Access extension brings getters, setters and unsetters that uses
 * `lodash` methods to support deep access to the Class.
 * @type {Object.<Fiber.Extension>}
 */
var $Access = new Fiber.Extension('Access', {

  /**
   * Default access level
   * @type {string}
   */
  __access: $Const.access.defaults,

  /**
   * Initializes Extension
   * @private
   */
  __init__: function() {
    $fn.descriptor.defineMacros(this.getCodeCapsule(), '__access', 'get/set');
  },

  /**
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided that defaults will be set to `null`
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: function(property, defaults) {
    if (! this.__isAllowed('get')) return void 0;
    return _.get(this, property, defaults);
  },

  /**
   * Sets `value` by given `property` key
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(property, value) {
    if (this.__isAllowed('set')) _.set(this, property, value);
    return this;
  },

  /**
   * Determine if Class has given `property`
   * @param {string} property
   * @returns {boolean}
   */
  has: function(property) {
    if (! this.__isAllowed('has')) return void 0;
    return _.has(this, property);
  },

  /**
   * Gets value by the given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: function(property, defaults) {
    if (! this.__isAllowed('result')) return void 0;
    return _.result(this, property, defaults);
  },

  /**
   * Removes `value` by given `property` key
   * @param {string} property
   * @returns {*}
   */
  unset: function(property) {
    if (this.__isAllowed('unset')) _.unset(this, property);
    return this;
  },

  /**
   * Alias for unset. Removes `value` by given `property` key
   * @param {string} property
   * @returns {*}
   */
  forget: function(property) {
    return this.unset(property);
  },

  /**
   * Determines if given method is not restricted for the current access level
   * @param {string} method
   * @returns {boolean}
   * @private
   */
  __isAllowed: function(method) {
    return $fn.isAllowedToAccess(this, method);
  },
});

/**
 * Register Extension
 */
$fn.extensions.register($Access);

/**
 * Add access mixin to the Fiber
 */
_.extend(Fiber, $Access.getCodeCapsule());
