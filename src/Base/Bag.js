/**
 * Fiber Bag Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Bag = Fiber.Class.extend({

  /**
   * Key that will dynamically created to store items
   * @type {string|Function}
   * @private
   */
  __holderKey: Fiber.Constants.bag.holderKey,

  /**
   * Constructs Bag
   * @param {Object} [storeable] - Items to set to the Bag
   */
  constructor: function(storeable) {
    $OwnProps.applyMethod($OwnProps.getInitMethod(), ['__holderKey'], this);

    var holderKey = this.getHolderKey();
    if (! this.hasHolderKey()) this.setHolderKey(holderKey);

    Fiber.fn.delegator.utilMixin('object', this, holderKey);
    Fiber.fn.apply(this, 'initialize', [arguments]);
  },

  /**
   * Sets key/value to the current Bag holder
   * @param {string} [key] - Key to set
   * @param {*} [value] - Value to set
   * @returns {Fiber.Bag}
   */
  set: function(key, value) {
    _.set(this.getHolder(), key, value);
    return this;
  },

  /**
   * Returns value by given `key` from the current Bag holder
   * @param {string} key - Key to look up value
   * @param {?*} [defaults] - Default value will be returned if `key` is not found
   * @returns {*}
   */
  get: function(key, defaults) {
    return _.get(this.getHolder(), key, defaults);
  },

  /**
   * Gets value by given `property` key from current Bag holder, if `property` value
   * is function then it will be called. You can provide `defaults` value that will be
   * returned if value is not found by the given key. If `defaults` is not provided then
   * defaults will be set to `null`.
   * @param {string} key - Key to remove value by
   * @return {*}
   */
  result: function(key) {
    return _.result(this.getHolder(), key);
  },

  /**
   * Checks if current Bag holder has given `key`
   * @param {string} key - Key to check existence of value in items Bag
   * @returns {boolean}
   */
  has: function(key) {
    return _.has(this.getHolder(), key);
  },

  /**
   * Removes key/value from current Bag holder at given `key`
   * @param {string} key - Key to remove value by
   * @return {Fiber.Bag}
   */
  forget: function(key) {
    _.unset(this.getHolder(), key);
    return this;
  },

  /**
   * Returns all items from the current Bag holder
   * @returns {Object}
   */
  all: function() {
    return this.getHolder();
  },

  /**
   * Returns copy of the current used Bag holder
   * @param {?boolean} [deep]
   * @returns {Object}
   */
  copy: function(deep) {
    return this.copyHolder(this.getHolderKey(), deep);
  },

  /**
   * Flushes current Bag holder items
   * @return {Fiber.Bag}
   */
  flush: function() {
    this.reset(this.getHolderKey());
    return this;
  },

  /**
   * Reset holder at the `holderKey`
   * @param {string} holderKey
   * @return {Fiber.Bag}
   */
  reset: function(holderKey) {
    return this.resetHolder(holderKey);
  },

  /**
   * Determine size of the current Bag holder items
   * @returns {number}
   */
  size: function() {
    return this.measureHolder(this.getHolder());
  },

  /**
   * Returns current used holder
   * @returns {Object}
   */
  getHolder: function() {
    return this[this.getHolderKey()];
  },

  /**
   * Sets new holder with the `holderKey` and storable value
   * @param {string} holderKey
   * @param {?Object} [storable={}]
   * @returns {Fiber.Bag}
   */
  setHolder: function(holderKey, storable) {
    this[holderKey] = val(storable, {}, _.isPlainObject);
    return this;
  },

  /**
   * Determines if Bag has current used holder
   * @returns {boolean}
   */
  hasHolder: function() {
    return _.isPlainObject(this.getHolder());
  },

  /**
   * Returns copy of the Bag holder at the `holderKey`
   * @param {?string} [holderKey]
   * @param {?boolean} [deep=false]
   * @returns {Object}
   */
  copyHolder: function(holderKey, deep) {
    var holder = this[holderKey];
    if (! _.isPlainObject(holder)) return {};
    return _[val(deep, false) ? 'cloneDeep' : 'clone'](holder);
  },

  /**
   * Resets holder at the `holderKey`
   * @param {string|Function} holderKey
   * @returns {Fiber.Bag}
   */
  resetHolder: function(holderKey) {
    return this.setHolder(holderKey, {});
  },

  /**
   * Returns holder size at the `holderKey`
   * @param holderKey
   * @returns {number}
   */
  measureHolder: function(holderKey) {
    return _.size(this[holderKey]);
  },

  /**
   * Returns holder key
   * @returns {string}
   */
  getHolderKey: function() {
    return _.result(this, '__holderKey');
  },

  /**
   * Sets holder key
   * @param {string|Function} holderKey
   * @return {Fiber.Bag}
   */
  setHolderKey: function(holderKey) {
    this.__holderKey = holderKey;
    return this;
  },

  /**
   * Determines if Bag has holder key and it is valid string
   * @returns {boolean}
   */
  hasHolderKey: function() {
    var key = _.result(this, '__holderKey');
    return _.isString(key) && ! _.isEmpty(key);
  }
});
