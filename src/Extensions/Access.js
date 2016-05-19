/**
 * Access extension brings getters, setters and unsetters that uses
 * `lodash` methods to support deep access to the Class.
 * @type {Object.<Fiber.Extension>}
 */
var $Access = new Fiber.Extension('Access', {

  /**
   * Access level.
   * @type {string}
   * @private
   */
  _accessLevel: 'public',

  /**
   * Access rules map
   * @type {Object}
   * @private
   */
  _accessRules: {
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
    if (! this.isAllowedToCall('get')) return void 0;
    return $get(this, property, defaults);
  },

  /**
   * Sets `value` by given `property` key.
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(property, value) {
    if (this.isAllowedToCall('set')) $set(this, property, value);
    return this;
  },

  /**
   * Determine if Class has given `property`.
   * @param {string} property
   * @returns {boolean}
   */
  has: function(property) {
    if (! this.isAllowedToCall('has')) return void 0;
    return $has(this, property);
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
    if (! this.isAllowedToCall('result')) return void 0;
    return $result(this, property, defaults);
  },

  /**
   * Removes `value` by given `property` key.
   * @param {string} property
   * @returns {*}
   */
  forget: function(property) {
    if (this.isAllowedToCall('unset')) $forget(this, property);
    return this;
  },

  /**
   * Determines if it is not restricted to call given method with current access level.
   * @param {string} method
   * @returns {boolean}
   */
  isAllowedToCall: function(method) {
    var methods = $get(this._accessRules, this._accessLevel);
    if (! $isArr(methods)) return $fn.cast.toBoolean(methods);
    return _.includes(methods, method);
  },

  /**
   * Sets access level.
   * @param {string} access
   * @returns {Object}
   */
  setAccess: function(access) {
    this._accessLevel = $valIncludes(access, this._accessLevel, _.keys(this._accessRules));
    return this;
  },

  /**
   * Returns access level.
   * @returns {string}
   */
  getAccess: function() {
    return this._accessLevel;
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
