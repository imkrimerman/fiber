/**
 * Fiber delegate support
 * @type {Object}
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
    var castedAlias = $fn.castArr(alias);
    var method = $fn.class.getMethod(Class, method);
    if (! method) return false;
    for (var i = 0; i < castedAlias.length; i ++) {
      var alias = castedAlias[i];
      if ($val(toProto, false) && Class.prototype) Class.prototype[alias] = method;
      else Class[alias] = method;
    }
    return true;
  },

  /**
   * Adds many `aliases` for `Class` methods
   * @param {Object} Class
   * @param {Object} aliases
   * @param {?boolean} [toProto=false]
   * @returns {boolean}
   */
  aliasMany: function(Class, aliases, toProto) {
    var result = [];
    for (var originalName in aliases) {
      var aliasList = $fn.castArr(aliases[originalName]);
      result.push(_.every(aliasList, function(alias) {
        return $fn.delegator.alias(Class, originalName, alias, toProto);
      }));
    }
    return $fn.inArrayAllSame(result);
  },

  /**
   * Proxies function to the `scope`. If `scope` is string then
   * it will be dynamically resolve from the bound object
   * @param {Function} method
   * @param {?Object|string} [scope=method]
   * @param {?number} [argCount]
   * @param {?boolean} [check=true]
   * @returns {Function}
   */
  proxy: function(method, scope, argCount, check) {
    $val(check, true) && $fn.delegator.expectFn(method);
    var hasArgCount = $isDef(argCount);
    return function() {
      var args = arguments;
      if (hasArgCount) args = argCount > 0 ? _.toArray(arguments).splice(0, argCount) : argCount === 0 ? [] : args;
      scope = _.isString(scope) ? this[scope] : $val(scope, null);
      return method.apply(scope, [this].concat($fn.cast.toArray(args)));
    };
  },

  /**
   * Proxies mixin to the given object
   * @param {Object} object
   * @param {Object} mixin
   * @returns {*}
   */
  proxyMixin: function(object, mixin, toProto) {
    $each(mixin, function(value, property) {
      var container = object;
      if (toProto) container = object.prototype;
      if (_.isFunction(value)) container[property] = $fn.delegator.proxy(value, object);
    });
    return object;
  },

  /**
   * Returns delegated object's method, that will dynamically resolve `attribute` from bound object
   * @param {Object} object
   * @param {string} method
   * @param {string} attribute
   * @returns {Function}
   */
  delegate: function(object, method, attribute) {
    var method = $fn.class.resolveMethod(object, method);
    return $fn.delegator.proxy(method, attribute);
  },

  /**
   * Creates proxy for the utility mixin
   * @param {string} method - method to delegate
   * @param {?string} [attribute=ThisReference] - attribute to find and delegate to
   * @param {?number} [num=false] - number of arguments to take, if `false` will take all arguments
   * @returns {Function}
   */
  proxyUtilMixin: function(method, attribute, num) {
    num = $val(num, false, _.isEmpty);
    return function() {
      var args = _.drop(arguments)
        , method = $fn.class.resolveMethod(_, method);

      attribute = _.isString(attribute) ? this[attribute] : this;
      args = $fn.argsConcatFlat(1, attribute, (num ? _.take(args, num) : args));

      if (_.isFunction(method)) return method.apply(_, args);
    };
  },

  /**
   * Delegates utility mixin to the object
   * @param {Object} object
   * @param {string} attribute
   * @param {Object|Function} owner
   * @param {Object} methods
   * @returns {Object}
   */
  delegateUtilMixin: function(object, attribute, methods) {
    if (_.isPlainObject(methods)) return this;

    for (var method in methods) {
      var len = methods[method]
        , zip = {name: method, len: len};

      if (_.isArray(len)) zip = _.zipObject(['name', 'len'], len);
      if (! _[method]) continue;
      object.prototype[zip.name] = $fn.delegator.proxyUtilMixin(method, attribute, zip.len);
    }

    return this;
  },

  /**
   * Delegate utility mixin to the `owner` object
   * @param {string} mixinKey
   * @param {Object} Object
   * @param {?string} [attribute=ThisReference]
   * @returns {Object}
   */
  utilMixin: function(mixinKey, Object, attribute) {
    return this.delegateUtilMixin(Object, attribute, this.getUtilMixin(mixinKey));
  },

  /**
   * Returns utility mixin or defaults
   * @param {string} mixin
   * @param {?*} [defaults=null]
   * @returns {Object|null|*}
   */
  getUtilMixin: function(mixin, defaults) {
    return this.utils[mixin] || $val(defaults, null);
  },

  /**
   * Expects that `method` is a valid function, otherwise logs error and throws Exception
   * @param {?string|Function} [method]
   * @param {?Object} [object]
   */
  expectFn: function(method, object) {
    if (_.isFunction(method)) return;
    method = $val(method, '', _.isString);
    var args = [
      'Can\'t proxy method ' + (method ? ' ' + method : method) +
      ', method is not available in the given object'
    ];

    if (object) args.push(object);
    if (! _.isFunction(method)) $Log.errorThrow.apply($Log, args);
  },

  /**
   * Utils holder
   * @type {Object}
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
