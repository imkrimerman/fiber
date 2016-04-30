/**
 * Fiber Bag Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Bag = Fiber.Class.extend({

  /**
   * Flag to set if Bag is firing building events
   * @type {boolean}
   */
  firing: true,

  /**
   * Key to use to dynamically created storage for the bag items.
   * @type {string|Function}
   * @private
   */
  __holder: '__items',

  /**
   * Constructs Bag.
   * @param {Object} [items] - Items to set to the Bag
   * @param {?Object} [options] - Bag initialize options
   */
  constructor: function(items, options) {
    $fn.class.handleOptions(this, options, {firing: this.firing, holder: this.__holder});
    this.firing = this.options.firing;
    this.__holder = this.options.holder;
    this.handleHolder(items);
    $fn.extensions.init(this);
    $fn.apply(this, 'initialize', [items, this.options]);
  },

  /**
   * Sets key/value to the current Bag holder.
   * @param {string} [key] - Key to set
   * @param {*} [value] - Value to set
   * @returns {Fiber.Bag}
   */
  set: function(key, value) {
    _.set(this.getHolder(), key, value);
    this.fireBagEvent('set', key, [key, value]);
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
    this.fireBagEvent('remove', key);
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
    return this.resetHolder(this.getHolderKey());
  },

  /**
   * Determine size of the current Bag holder items
   * @returns {number}
   */
  size: function() {
    return this.sizeHolder(this.getHolder());
  },

  /**
   * Returns current used holder
   * @param {?string} [holderKey]
   * @returns {Object}
   */
  getHolder: function(holderKey) {
    return this[holderKey || this.getHolderKey()];
  },

  /**
   * Sets new holder with the `holderKey` and storable value
   * @param {string} holderKey
   * @param {?Object} [storable={}]
   * @returns {Fiber.Bag}
   */
  setHolder: function(holderKey, storable) {
    this[holderKey || this.getHolderKey()] = $val(storable, {}, _.isPlainObject);
    this.fireBagEvent('holder:set', holderKey, [storable]);
    return this;
  },

  /**
   * Determines if Bag has current used holder
   * @param {?string} [holderKey]
   * @returns {boolean}
   */
  hasHolder: function(holderKey) {
    return _.isPlainObject(this.getHolder(holderKey));
  },

  /**
   * Returns copy of the Bag holder at the `holderKey`
   * @param {?string} [holderKey]
   * @param {?boolean} [deep=false]
   * @returns {Object}
   */
  copyHolder: function(holderKey, deep) {
    var clone = $fn.clone(this[holderKey || this.getHolderKey()], deep);
    this.fireBagEvent('holder:copy', holderKey);
    return clone;
  },

  /**
   * Resets holder at the `holderKey`
   * @param {string|Function} holderKey
   * @returns {Fiber.Bag}
   */
  resetHolder: function(holderKey) {
    this.setHolder(holderKey, {});
    this.fireBagEvent('holder:reset', holderKey);
    return this;
  },

  /**
   * Returns holder size at the `holderKey`
   * @param holderKey
   * @returns {number}
   */
  sizeHolder: function(holderKey) {
    return _.size(this[holderKey || this.getHolderKey()]);
  },

  /**
   * Handles holder key and sets items
   * @param {Object} [items] - Items to set to the Bag
   * @param {?boolean} [delegate=true]
   */
  handleHolder: function(items, delegate) {
    var holderKey = this.getHolderKey();
    if (! this.hasHolderKey()) this.setHolderKey(this.__holder);
    this.setHolder(holderKey, items);
    $val(delegate, true) && $fn.delegator.utilMixin('object', this, holderKey);
  },

  /**
   * Returns holder key
   * @returns {string}
   */
  getHolderKey: function() {
    return _.result(this, '__holder');
  },

  /**
   * Sets holder key
   * @param {string|Function} holderKey
   * @return {Fiber.Bag}
   */
  setHolderKey: function(holderKey) {
    this.__holder = holderKey;
    return this;
  },

  /**
   * Determines if Bag has holder key and it is valid string
   * @returns {boolean}
   */
  hasHolderKey: function() {
    var key = _.result(this, '__holder');
    return _.isString(key) && ! _.isEmpty(key);
  },

  /**
   * Fires bag events
   * @param {string} event
   * @param {?string} [key]
   * @param {?Array|*} [args]
   * @returns {Fiber.Bag}
   */
  fireBagEvent: function(event, key, args) {
    if (! this.firing) return this;
    args = $fn.merge($fn.castArr(args || []), [this]);
    $fn.fireAttribute(this, event, key, args);
    var triggerKeyEvent = _.isString(key) && ! _.isEmpty(key);
    this.fire.apply(this, [event].concat(args));
    if (triggerKeyEvent) {
      var keyEvent =  _.trim(event, ':') + ':' + _.trim(key, ':');
      this.fire.apply(this, [keyEvent].concat(args));
    }
    return this;
  },

});
