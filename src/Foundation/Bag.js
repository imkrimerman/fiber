/**
 * Fiber Bag Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Bag = Fiber.Class.implement('Access').extend([
  $Storage, {

    /**
     * Events configuration
     * @type {Object}
     */
    eventsConfig: {

      /**
       * Events catalog to hold the events
       * @type {Object}
       */
      catalog: {
        set: 'set',
        forget: 'forget',
        reset: 'reset',
        flush: 'flush',
        copy: 'copy'
      }
    },

    /**
     * Bag items defaults
     * @type {Object|function()}
     */
    defaults: {},

    /**
     * Class type signature
     * @type {string}
     * @private
     */
    _signature: '[object Fiber.Bag]',

    /**
     * Constructs Bag.
     * @param {Object} [items] - Items to set to the Bag
     * @param {?Object} [options] - Bag initialize options
     */
    constructor: function(items, options) {
      this._initHolder(items);
      this._handleDefaults();
      this.$superInit(options);
    },

    /**
     * Gets value by given `path`. You can provide `defaults` value that
     * will be returned if value is not found by the given path. If `defaults` is
     * not provided then `null` will be returned.
     * @param {string} path
     * @param {*} [defaults]
     * @returns {*}
     */
    get: function(path, defaults) {
      if ($fn.computed.has(this, path)) return $fn.computed.get(this, path);
      return this.$super('get', [path, defaults]);
    },

    /**
     * Sets path/value to the current Bag holder.
     * @param {string} [path] - Key to set
     * @param {*} [value] - Value to set
     * @returns {Fiber.Bag}
     */
    set: function(path, value) {
      if (_.isPlainObject(path)) return this.reset(path);
      if ($fn.computed.has(this, path)) $fn.computed.set(this, path, value);
      else $set(this._items, path, value);
      this._fireEvent('set', path, [path, value, this]);
      return this;
    },

    /**
     * Checks if current Bag holder has given `key`
     * @param {string} key - Key to check existence of value in items Bag
     * @returns {boolean}
     */
    has: function(key) {
      return $fn.computed.has(this, path) || $has(this._items, key);
    },

    /**
     * Removes path/value from current Bag holder at given `path`
     * @param {string} path - Key to remove value by
     * @return {*} - value that is removed
     */
    forget: function(path) {
      var value = this.get(path);
      $forget(this._items, path);
      this._fireEvent('forget', [value, path, this]);
      return value;
    },

    /**
     * Resets bag holder with the given `items`
     * @param {Object} items
     * @returns {Fiber.Bag}
     */
    reset: function(items) {
      if (_.isPlainObject(items)) this._items = items;
      this._fireEvent('reset', null, [items, this]);
      return this;
    },

    /**
     * Flushes current Bag holder items
     * @return {Fiber.Bag}
     */
    flush: function() {
      this._items = {};
      this._fireEvent('flush', null, this);
      return this;
    },

    /**
     * Returns copy of the current used Bag holder
     * @param {?boolean} [deep=true]
     * @returns {Object}
     */
    copy: function(deep) {
      deep = $val(deep, true, _.isBoolean);
      var clone = $fn.clone(this._items, deep);
      this._fireEvent('copy', null, [clone, deep, this]);
      return clone;
    },

    /**
     * Determine size of the current Bag holder items
     * @returns {number}
     */
    size: function() {
      return _.size(this._items);
    },

    /**
     * Initializes bag holder
     * @param {?Object} [items]
     * @returns {Fiber.Bag}
     * @private
     */
    _initHolder: function(items) {
      if (! this._items || ! _.isPlainObject(this._items)) this.flush();
      if (_.isPlainObject(items)) this._items = items;
      return this;
    },

    /**
     * Ensures that default values are presenting in the Bag.
     * @returns {Fiber.Bag}
     * @private
     */
    _handleDefaults: function() {
      if (! _.isEmpty(this.defaults)) _.defaultsDeep(this._items, $result(this.defaults));
      return this;
    },

    /**
     * Fires bag events.
     * @param {string} event
     * @param {?string} [path]
     * @param {?Array|*} [args]
     * @returns {Fiber.Bag}
     */
    _fireEvent: function(event, path, args) {
      $fn.fireAttribute(this, event, path, $fn.merge($castArr(args), [this]));
      return this;
    }
  }
]);

/**
 * Add Bag type to Fiber
 */
Fiber.Types.Bag = new Fiber.Type({
  type: 'object',
  signature: Fiber.Bag.prototype._signature,
  example: function() {return new Fiber.Bag;}
});
