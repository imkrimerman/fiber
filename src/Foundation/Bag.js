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
      this.$superInit(options);
    },

    /**
     * Sets key/value to the current Bag holder.
     * @param {string} [key] - Key to set
     * @param {*} [value] - Value to set
     * @returns {Fiber.Bag}
     */
    set: function(key, value) {
      if (_.isPlainObject(key)) return this.reset(key);
      $set(this._items, key, value);
      this._fireEvent('set', key, [key, value, this]);
      return this;
    },

    /**
     * Removes key/value from current Bag holder at given `key`
     * @param {string} key - Key to remove value by
     * @return {*} - value that is removed
     */
    forget: function(key) {
      var value = this.get(key);
      $forget(this._items, key);
      this._fireEvent('forget', [value, key, this]);
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
     * Fires bag events
     * @param {string} event
     * @param {?string} [key]
     * @param {?Array|*} [args]
     * @returns {Fiber.Bag}
     */
    _fireEvent: function(event, key, args) {
      $fn.fireAttribute(this, event, key, $fn.merge($castArr(args), [this]));
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
