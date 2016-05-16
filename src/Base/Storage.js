/**
 * Fiber Storage
 * @class
 * @private
 */
var $Storage = function(storable) {
  this._items = _.isPlainObject(storable) ? storable : {};
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
   * Picks values by provided `paths`.
   * @param {Array|string} paths
   * @returns {Object}
   */
  pick: function(paths) {
    return _.pick(this._items, $castArr(paths));
  },

  /**
   * Omits values by provided `paths`.
   * @param {Array|string} paths
   * @returns {Object}
   */
  omit: function(paths) {
    return _.omit(this._items, $castArr(paths));
  }
});
