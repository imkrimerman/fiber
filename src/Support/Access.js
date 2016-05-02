/**
 * Access support
 * @type {Object}
 */
Fiber.fn.access = {

  /**
   * Private configuration.
   * @type {Object}
   */
  __private: {

    /**
     * Private key name.
     * @type {string}
     */
    key: '__access',

    /**
     * Default access level.
     * @type {string}
     */
    access: 'public',

    /**
     * Methods list.
     * @type {Array.<string>}
     */
    methods: ['get', 'set', 'has', 'result', 'unset'],

    /**
     * Methods level map.
     * @type {Object}
     */
    allow: {
      private: false,
      protected: ['get', 'result', 'has'],
      public: true
    }
  },

  /**
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided that defaults will be set to `null`.
   * @param {Object} object
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: function(object, property, defaults) {
    if (! $fn.access.__isAllowed(object, 'get')) return void 0;
    return _.get(object, property, defaults);
  },

  /**
   * Sets `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(object, property, value) {
    if ($fn.access.__isAllowed(object, 'set')) _.set(object, property, value);
    return object;
  },

  /**
   * Determine if Class has given `property`.
   * @param {Object} object
   * @param {string} property
   * @returns {boolean}
   */
  has: function(object, property) {
    if (! $fn.access.__isAllowed(object, 'has')) return false;
    return _.has(object, property);
  },

  /**
   * Gets value by the given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`.
   * @param {Object} object
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: function(object, property, defaults) {
    if (! object.__isAllowed('result')) return void 0;
    return _.result(object, property, defaults);
  },

  /**
   * Removes `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @returns {*}
   */
  unset: function(object, property) {
    if (object.__isAllowed('unset')) _.unset(object, property);
    return object;
  },

  /**
   * Alias for unset. Removes `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @returns {*}
   */
  forget: function(object, property) {
    return object.unset(property);
  },

  /**
   * Sets access level.
   * @param {Object} object
   * @param {string} access
   * @returns {Object}
   */
  setAccess: function(object, access) {
    return $fn.access.setPrivate(object, 'access', access);
  },

  /**
   * Returns access level.
   * @param {Object} object
   * @returns {string}
   */
  getAccess: function(object) {
    return $fn.access.getPrivate(object, 'access');
  },

  /**
   * Determines if level is valid and exists.
   * @param {Object} object
   * @returns {boolean}
   */
  hasAccess: function(object) {
    return $fn.access.hasPrivate(object, 'access');
  },

  /**
   * Sets private property to the given value.
   * @param {Object} object
   * @param {string} key
   * @param {*} value
   * @returns {Object}
   */
  setPrivate: function(object, key, value) {
    if (! key) return object;
    _.set(object, $fn.access.makePrivateKey(key), value);
    return object;
  },

  /**
   * Returns private property of the object.
   * @param {Object} object
   * @param {string} [key]
   * @returns {*}
   */
  getPrivate: function(object, key) {
    return _.get(object, $fn.access.makePrivateKey(key));
  },

  /**
   * Determines if object has private property.
   * @param {Object} object
   * @param {string} [key]
   * @returns {boolean}
   */
  hasPrivate: function(object, key) {
    return _.has(object, $fn.access.makePrivateKey(key));
  },

  /**
   * Returns key transformed to private key.
   * Adds prefix to the key with the private object destination path.
   * @param {string} key
   * @returns {string|*}
   */
  makePrivateKey: function(key) {
    return $fn.join([Fiber.internal.privateProperty, key], '.');
  },

  /**
   * Determines if given method is not restricted for the current access level.
   * @param {string} method
   * @returns {boolean}
   * @private
   */
  __isAllowed: function(object, method) {
    return $fn.isAllowedToAccess(object, method);
  },
};
