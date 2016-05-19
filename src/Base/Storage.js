/**
 * Fiber Storage
 * @class
 * @private
 */
var $Storage = function(storable) {
  this._items = $isPlain(storable) ? storable : {};
};

/**
 * Storage prototype
 * @type {Object}
 */
_.extend($Storage.prototype, {

  /**
   * Gets value by given `path`. You can provide `defaults` value that
   * will be returned if value is not found by the given path. If `defaults` is
   * not provided then `null` will be returned.
   * @param {string} path
   * @param {*} [defaults]
   * @returns {*}
   */
  get: function(path, defaults) {
    return $get(this._items, path, defaults);
  },

  /**
   * Sets `value` by given `property` path.
   * @param {string} path
   * @param {*} value
   * @returns {Storage|Object}
   */
  set: function(path, value) {
    return $set(this._items, path, value);
  },

  /**
   * Determine if has given `path`.
   * @param {string} path
   * @returns {boolean}
   */
  has: function(path) {
    return $has(this._items, path);
  },

  /**
   * Gets value by the given `path`, if `path` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given path. If `defaults` is not provided then `null` will be returned.
   * @param {string} path
   * @param {*} defaults
   * @returns {*}
   */
  result: function(path, defaults) {
    return $result(this._items, path, defaults);
  },

  /**
   * Removes `value` by the given `path`.
   * @param {string} path
   * @returns {Storage|Object}
   */
  forget: function(path) {
    return $forget(this._items, path);
  },

  /**
   * Picks values by provided `keys`.
   * @param {Array} keys
   * @returns {Object}
   */
  pick: function(keys) {
    var args = arguments.length === 1 ? $castArr(arguments[0]) : $castArr(arguments);
    return $pick.apply(null, [this._items].concat([args]));
  },

  /**
   * Omits values by provided `keys`.
   * @param {Array} keys
   * @returns {Object}
   */
  omit: function(keys) {
    var args = arguments.length === 1 ? $castArr(arguments[0]) : $castArr(arguments);
    return $omit.apply(null, [this._items].concat([args]));
  },

  /**
   * Returns all items from the current Bag holder
   * @returns {Object}
   */
  all: function() {
    return $clone(this._items);
  }
});
