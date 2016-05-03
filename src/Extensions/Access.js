/**
 * Access extension brings getters, setters and unsetters that uses
 * `lodash` methods to support deep access to the Class.
 * @type {Object.<Fiber.Extension>}
 */
var $Access = new Fiber.Extension('Access', {

  /**
   * Default access level.
   * @type {string}
   * @private
   */
  __access: 'public',

  /**
   * Methods list.
   * @type {Array.<string>}
   * @private
   */
  __methods: ['get', 'set', 'has', 'result', 'forget'],

  /**
   * Methods level map.
   * @type {Object}
   * @private
   */
  __allow: {
    private: false,
    protected: ['get', 'result', 'has'],
    public: true
  },

  /**
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided that defaults will be set to `null`.
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: function(property, defaults) {
    if (! this.isAllowedToAccess('get')) return void 0;
    return $fn.get(this, property, defaults);
  },

  /**
   * Sets `value` by given `property` key.
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(property, value) {
    if (this.isAllowedToAccess('set')) $fn.set(this, property, value);
    return this;
  },

  /**
   * Determine if Class has given `property`.
   * @param {string} property
   * @returns {boolean}
   */
  has: function(property) {
    if (! this.isAllowedToAccess('has')) return void 0;
    return $fn.has(this, property);
  },

  /**
   * Gets value by the given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`.
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: function(property, defaults) {
    if (! this.isAllowedToAccess('result')) return void 0;
    return $fn.result(this, property, defaults);
  },

  /**
   * Removes `value` by given `property` key.
   * @param {string} property
   * @returns {*}
   */
  forget: function(property) {
    if (this.isAllowedToAccess('unset')) $fn.forget(this, property);
    return this;
  },

  /**
   * Sets access level.
   * @param {string} access
   * @returns {Object}
   */
  setAccess: function(access) {
    this.__access = $val(access, this.__access, $fn.createIncludes(this.__methods));
    return this;
  },

  /**
   * Returns access level.
   * @returns {string}
   */
  getAccess: function() {
    return this.__access;
  },

  /**
   * Determines if given method is not restricted to call for the current access level.
   * @param {string} method
   * @returns {boolean}
   */
  isAllowedToAccess: function(method) {
    return $fn.isAllowedToAccess(this, method);
  }
});

/**
 * Register Extension
 */
$Ioc.extension('Access', $Access);

/**
 * Add access mixin to the Fiber
 */
$Access.includeTo(Fiber);
