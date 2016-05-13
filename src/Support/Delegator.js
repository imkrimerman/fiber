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
   * @param {function()} method
   * @param {?Object|string} [scope=method]
   * @param {?number} [argCount]
   * @param {?boolean} [check=true]
   * @returns {function()}
   */
  proxy: function(method, scope, argCount, check) {
    $val(check, true) && $fn.delegator.expectFn(method);
    var hasArgCount = $isDef(argCount);
    return function() {
      var args = arguments;
      if (hasArgCount) args = argCount > 0 ? _.toArray(arguments).splice(0, argCount) : argCount === 0 ? [] : args;
      scope = _.isString(scope) ? this[scope] : $val(scope, null);
      return method.apply(scope, $fn.argsConcat(this, $fn.cast.toArray(args)));
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
   * @returns {function()}
   */
  delegate: function(object, method, attribute) {
    var method = $fn.class.resolveMethod(object, method);
    return $fn.delegator.proxy(method, attribute);
  },

  /**
   * Expects that `method` is a valid function, otherwise logs error and throws Exception
   * @param {string|function()} [method]
   * @param {Object} [object]
   */
  expectFn: function(method, object) {
    if (_.isFunction(method)) return;
    method = $val(method, '', _.isString);
    var args = [
      'Can\'t proxy method ' + (method ? ' ' + method : method) +
      ', method is not available in the given object'
    ];
    if (object) args.push(object);
    if (! _.isFunction(method) && $log) $log.errorThrow.apply($log, args);
  }
};
