/**
 * Storage Adapter
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Storage.Adapter = Fiber.Class.implement('StorageAdapter').extend({

  /**
   * Storage prefix.
   * @type {string|function()}
   */
  prefix: '@Fiber.Storage',

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Storage.Adapter]',

  /**
   * Constructs Adapter
   * @param {...args}
   */
  constructor: function() {
    this._stack = [];
    this.$superInit(arguments);
  },

  /**
   * Requests value by `key` if one is not exist then will return `defaults`.
   * @param {string} key - Key to retrieve value
   * @param {function()} [callback] - Callback that will be called when value is retrieved
   * @param {*} [defaults] - Value that will be returned if `key` is not exist in the storage
   * @returns {Fiber.Storage.Adapter}
   */
  get: function(key, callback, defaults) {
    return this.push(callback).request('get', key, defaults);
  },

  /**
   * Requests set of value by `key`.
   * @param {string} [key] - Key to set value
   * @param {*} [value] - Value to set
   * @param {function()} [callback] - Callback that will be called when value is set
   * @returns {Fiber.Storage.Adapter}
   */
  set: function(key, value, callback) {
    return this.push(callback).request('set', key, value);
  },

  /**
   * Requests check of `key` existence in the storage.
   * @param {string} key - Key to check existence
   * @param {function()} [callback] - Callback that will be called when value existence is checked
   * @returns {boolean}
   */
  has: function(key, callback) {
    return this.push(callback).request('has', key);
  },

  /**
   * Requests remove of `key` from the storage.
   * @param {string} key - Key to remove value by
   * @param {function()} [callback] - Callback that will be called when value is removed
   * @return {*} - value that is removed
   */
  forget: function(key, callback) {
    return this.push(callback).request('forget', key);
  },

  /**
   * Requests adapter method with arguments.
   * @param {string} method
   * @param {string} key
   * @param {*} [value]
   * @param {Object} [options]
   * @returns {Object.<Fiber.Request>}
   */
  request: function(method, key, value, options) {
    if (! $fn.has(this, method)) return false;
    return new Fiber.Request(method, $fn.createPlain(key, value), $valMerge(options, {
      $callback: this.pop(),
      fake: true
    }));
  },

  /**
   * Returns parsed response.
   * @param response
   * @returns {*}
   */
  parse: $fn.through,

  /**
   * Returns callback transformed object from the request to the storage.
   * Method that is used to wrap/parse response from the storage before it will returned by the `request` method.
   * @param {*} object
   * @returns {*}
   */
  response: function(object) {
    return new Fiber.Sync.Response(object);
  },

  /**
   * Pushes request callback to the stack
   * @param {function()} callback
   * @returns {Fiber.Storage.Adapter}
   */
  push: function(callback) {
    if (! _.isFunction(callback)) callback = $fn.through;
    this._stack.push(callback);
    return this;
  },

  /**
   * Removes last stack item and returns it.
   * @returns {function()}
   */
  pop: function() {
    return this._stack.pop();
  },
});
