/**
 * Fiber delegate support
 * @var {Object}
 */
Fiber.fn.delegator = {

  /**
   * Adds `alias` for the `method` in `Class`
   * @param {Object} Class
   * @param {string} method
   * @param {string} alias
   * @param {?boolean} [toProto=false]
   * @returns {boolean}
   */
  alias: function(Class, method, alias, toProto) {
    var method = Fiber.fn.getMethod(Class, method);
    if (! method) return false;
    if (val(toProto, false) && Class.prototype) Class.prototype[alias] = method;
    else Class[alias] = method;
    return true;
  },

  /**
   * Proxies function
   * @param {Function} fn
   * @param {?Object} [scope=fn]
   * @returns {Function}
   */
  proxy: function(fn, scope) {
    scope = val(scope, fn);
    return function() {
      return fn.apply(scope, Fiber.fn.argsConcat(this, arguments));
    };
  },

  /**
   * Creates proxy with strict number of arguments to accept
   * @param {Object} owner - owner object of method
   * @param {string} method - method to delegate
   * @param {?string} [attribute=ThisReference] - attribute to find and delegate to
   * @param {?number} [num=false] - number of arguments to take, if `false` will take all arguments
   * @returns {Function}
   */
  strictProxy: function(owner, method, attribute, num) {
    num = val(num, false, _.isEmpty);
    return function() {
      var args = _.drop(arguments);
      attribute = _.isString(attribute) ? this[attribute] : this;
      args = Fiber.fn.argsConcatFlat(1, attribute, (num ? _.take(args, num) : args));
      return owner[method].apply(owner, args);
    };
  },

  /**
   * Delegates methods of `Object` to the future `owner`
   * @param {Object} Object
   * @param {Object} methods
   * @param {?string} [attribute=ThisReference]
   * @param {?Object|Function} [owner=_]
   * @returns {Object}
   */
  delegate: function(Object, methods, attribute, owner) {
    owner = owner || _;

    for (var method in methods) {
      var len = methods[method], destruct = {name: method, len: len};
      if (_.isArray(len)) destruct = _.zipObject(['name', 'len'], len);
      if (! owner[method]) continue;
      Object.prototype[destruct.name] = this.strictProxy(owner, method, attribute, destruct.len);
    }

    return this;
  },

  /**
   * Delegate utility mixin to the `owner` object
   * @param {Object} Object
   * @param {Array|string} methods
   * @param {Object|Function} owner
   * @param {?string} [attribute=ThisReference]
   * @returns {Object}
   */
  utilMixin: function(Object, mixin, owner, attribute) {
    var retrieved = this.getUtilMixin(mixin);

    if (_.isPlainObject(retrieved))
      this.delegate(Object, retrieved, owner, attribute);

    return this;
  },

  /**
   * Returns utility mixin or defaults
   * @param {string} mixin
   * @param {?*} [defaults=null]
   * @returns {Object|null|*}
   */
  getUtilMixin: function(mixin, defaults) {
    return this.utils[mixin] || val(defaults, null);
  },

  /**
   * Utils holder
   * @var {Object}
   */
  utils: {
    object: {
      merge: 0, extend: 0, defaults: 0, defaultsDeep: 0, functions: 0,
      functionsIn: 0, pick: 0, omit: 0, findKey: 1, invert: 1, mapKeys: 2,
      transform: 3, values: 0, valuesIn: 0, keys: 0, keysIn: 0
    },
    array: {
      chunk: 2, compact: 1, concat: 0, difference: 0, drop: 2, fill: 4, findIndex: 2,
      findLastIndex: 2, first: 0, last: 0, flatten: 1, flattenDeep: 1, flattenDepth: 2,
      indexOf: 3, intersection: 0, join: 2, pull: 2, pullAll: 2, remove: 2, reverse: 0,
      slice: 3, take: 2, union: 0, uniq: ['unique', 0], unzip: 0, without: 2, zip: 0,
      zipObject: 2, zipObjectDeep: 2, includes: 2, forEach: 2, each: 2, every: 2,
      map: 2, orderBy: 3, sample: ['random', 1], shuffle: 1, size: 1, some: 2, sortBy: 2,
    },
    collection: {
      countBy: 2, forEach: 2, each: 2, every: 2, filter: 2, find: 2, groupBy: 2, includes: 2,
      invokeMap: 3, keyBy: 2, map: 2, orderBy: 3, partition: 2, reduce: 3, reject: 2, sample: ['random', 1],
      shuffle: 1, size: 1, some: 2, sortBy: 2
    }
  }
};
