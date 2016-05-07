/**
 * Retriever Extension
 * @type {Object.<Fiber.Extension>}
 */
var $Retriever = new Fiber.Extension('Retriever', {

  /**
   * Default retriever access level.
   * @type {string}
   * @private
   */
  _retrieverAccess: 'public',

  /**
   * Retriever methods that will be used to for partial access.
   * @type {Array.<string>}
   * @private
   */
  _retrieverAccessMethods: ['get', 'set', 'has', 'result', 'forget'],

  /**
   * Retriever access rules
   * @type {Object}
   * @private
   */
  _retrieverAccessRules: {
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
    return $fn.get(this, property, defaults);
  },

  /**
   * Sets `value` by given `property` key.
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(property, value) {
    if (this.isAllowedToCall('set')) $fn.set(this, property, value);
    return this;
  },

  /**
   * Determine if Class has given `property`.
   * @param {string} property
   * @returns {boolean}
   */
  has: function(property) {
    if (! this.isAllowedToCall('has')) return void 0;
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
    if (! this.isAllowedToCall('result')) return void 0;
    return $fn.result(this, property, defaults);
  },

  /**
   * Removes `value` by given `property` key.
   * @param {string} property
   * @returns {*}
   */
  forget: function(property) {
    if (this.isAllowedToCall('forget')) $fn.forget(this, property);
    return this;
  },

  /**
   * Sets access level.
   * @param {string} access
   * @returns {Object}
   */
  setAccess: function(access) {
    this._retrieverAccess = $val(access, this._retrieverAccess, $fn.createIncludes(this._retrieverAccessMethods));
    return this;
  },

  /**
   * Returns access level.
   * @returns {string}
   */
  getAccess: function() {
    return this._retrieverAccess;
  },

  /**
   * Determines if given method is not restricted to call for the current access level.
   * @param {string} method
   * @returns {boolean}
   */
  isAllowedToCall: function(method) {
    return $fn.isAllowedToCall(this, method);
  }
});

/**
 * Register Extension
 */
$Ioc.extension('Retriever', $Retriever);

/**
 * Add retriever extension to the Fiber
 */
$Retriever.includeTo(Fiber);
