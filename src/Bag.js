/**
 * Fiber Bag Class
 * @class
 * @type {Function}
 * @extends {Fiber.Class}
 * @memberof Fiber#
 */
Fiber.Bag = Fiber.fn.class.make(Fiber.Class, ['NsEvents', {

  /**
   * Events namespace
   * @member {string}
   */
  eventsNs: 'bag',

  /**
   * Bag items
   * @member {Object}
   */
  items: {},

  /**
   * Access extension to provide get/set to items
   * @member {Fiber.Extensions.Access}
   */
  access: null,

  /**
   * Initializes bag
   * @param {?Object} [items] - Items to set to the Bag
   */
  initialize: function(items) {
    this.items = val(items, {}, _.isPlainObject);
    this.access = Fiber.getExtension('Access', this.items);
  },

  /**
   * Sets key/value to the bag
   * @param {string} [key] - Key to set
   * @param {*} [value] - Value to set
   * @returns {Fiber.Bag}
   */
  set: function(key, value) {
    this.access.set(key, value);
    return this;
  },

  /**
   * Returns value by given `key`
   * @param {string} key - Key to look up value
   * @param {?*} [defaults] - Default value will be returned if `key` is not found
   * @returns {*}
   */
  get: function(key, defaults) {
    return this.access.get(key, defaults);
  },

  /**
   * Checks if bag has given `key`
   * @param {string} key - Key to check existence of value in items bag
   * @returns {boolean}
   */
  has: function(key) {
    return this.access.has(key);
  },

  /**
   * Removes key/value from bag by given `key`
   * @param {string} key - Key to remove value by
   * @return {Fiber.Bag}
   */
  forget: function(key) {
    this.access.forget(key);
    return this;
  },

  /**
   * Clears bag items
   * @return {Fiber.Bag}
   */
  clear: function() {
    this.items = {};
    return this;
  }
}]);
