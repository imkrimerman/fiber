/**
 * Fiber Bag Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Bag = Fiber.fn.class.extend(Fiber.Class, {

  /**
   * Bag items
   * @var {Object}
   */
  items: {},

  /**
   * Initializes bag
   * @param {?Object} [items] - Items to set to the Bag
   */
  initialize: function(items) {
    this.items = val(items, {}, _.isPlainObject);
  },

  /**
   * Sets key/value to the bag
   * @param {string} [key] - Key to set
   * @param {*} [value] - Value to set
   * @returns {Fiber.Bag}
   */
  set: function(key, value) {
    _.set(this.items, key, value);
    return this;
  },

  /**
   * Returns value by given `key`
   * @param {string} key - Key to look up value
   * @param {?*} [defaults] - Default value will be returned if `key` is not found
   * @returns {*}
   */
  get: function(key, defaults) {
    return _.get(this.items, key, defaults);
  },

  /**
   * Gets value by given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`
   * @param {string} key - Key to remove value by
   * @return {*}
   */
  result: function(key) {
    return _.result(this.items, key);
  },

  /**
   * Checks if bag has given `key`
   * @param {string} key - Key to check existence of value in items bag
   * @returns {boolean}
   */
  has: function(key) {
    return _.has(this.items, key);
  },

  /**
   * Removes key/value from bag by given `key`
   * @param {string} key - Key to remove value by
   * @return {Fiber.Bag}
   */
  forget: function(key) {
    _.unset(this.items, key);
    return this;
  },

  /**
   * Returns all items from the Bag
   * @returns {Object}
   */
  all: function() {
    return this.items;
  },

  /**
   * Flushes bag items
   * @return {Fiber.Bag}
   */
  flush: function() {
    this.items = {};
    return this;
  },

  /**
   * Determine size of the Bag items
   * @returns {number}
   */
  size: function() {
    return _.size(this.items);
  },
});

/**
 * Include utility object mixin to the Bag, to work with `items`
 */
Fiber.fn.delegator.utilMixin(Fiber.Bag, 'object', 'items');
