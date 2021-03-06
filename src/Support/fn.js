/**
 * Fiber support function
 * @type {Object}
 */
$fn = Fiber.fn = {

  /**
   * Private configuration
   * @type {Object}
   */
  __private: {

    /**
     * List of properties to exclude when mixin functions to Class prototype
     * @type {Array}
     */
    protoExclude: ['proto', 'protoExclude'],

    /**
     * Value that represents not defined state.
     * @type {string}
     */
    notDefined: '$__NULL__$'
  },

  /**
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided that defaults will be set to `null`.
   * @param {Object} object
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: function(object, property, defaults) {
    return _.get(object, property, defaults);
  },

  /**
   * Sets `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(object, property, value) {
    _.set(object, property, value);
    return object;
  },

  /**
   * Determine if Class has given `property`.
   * @param {Object} object
   * @param {string} property
   * @returns {boolean}
   */
  has: function(object, property) {
    return _.has(object, property);
  },

  /**
   * Gets value by the given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`.
   * @param {Object} object
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: function(object, property, defaults) {
    if (_.isFunction(object)) return object();
    return _.result(object, property, defaults);
  },

  /**
   * Alias for unset. Removes `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @returns {Object}
   */
  forget: function(object, property) {
    _.unset(object, property);
    return object;
  },

  /**
   * Returns value if not undefined or null,
   * otherwise returns defaults or $__NULL__$ value
   * @see https://github.com/imkrimerman/im.val (npm version)
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {?Function|Function[]} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @returns {*}
   */
  val: function(value, defaults, checker, match) {
    // if defaults not specified then assign notDefined `$__NULL__$` value
    defaults = arguments.length > 1 ? defaults : $private($fn, 'notDefined');
    // if we don't have any `value` then return `defaults`
    if (! arguments.length) return defaults;
    // if value check was made and it's not valid then return `defaults`
    if (! $fn.valCheck(value, checker, match)) return defaults;
    // if value not specified return defaults, otherwise return value;
    return value != null ? value : defaults;
  },

  /**
   * Checks value with the given checkers
   * @param {*} value
   * @param {Array|Function} checkers
   * @param {?string} [match='every']
   * @returns {boolean}
   */
  valCheck: function(value, checkers, match) {
    match = _.isString(match) ? match : 'every';
    // if value and checker is specified then use it to additionally check value
    if (! _.isArray(checkers) && ! _.isFunction(checkers)) return true;
    return _[match]($fn.castArr(checkers), function(check) {
      if (_.isFunction(check) && value != null) {
        // if `check` returns true then we are good
        if (check(value)) return true;
        // and return false otherwise
        return false;
      }
    });
  },

  /**
   * Applies `val` function and calls callback with result as first argument
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {Function} cb - callback to call after check
   * @param {?Function} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @returns {*}
   */
  valCb: function(value, defaults, cb, checker, match) {
    return $val(cb, _.noop, _.isFunction)($val(value, defaults, checker, match));
  },

  /**
   * Applies `val` checker function and extends checked value with `extender` if allowed.
   * @param {*} value - value to check
   * @param {Object} extender - object to extend with
   * @param {?Function|string} [method=_.extend] - function to use to merge the objects (can be lodash method name or
   * function)
   * @param {?Function} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @param {?boolean} [toOwn=false] - if true then sets extender directly to checked value,
   * otherwise creates new object and merges checked value with extender
   * @returns {Object|Function}
   */
  valMerge: function(value, extender, method, checker, match, toOwn) {
    method = $val(method, _.extend, [_.isFunction, _.isString], 'some');
    if (_.isString(method) && _.has(_, method)) method = _[method];
    if (! $isDef(checker)) checker = _.isPlainObject;
    toOwn = $val(toOwn, false, _.isBoolean);
    return $fn.valCb(value, {}, function(checked) {
      var args = toOwn ? [checked, extender] : [{}, checked, extender];
      if (! $fn.isExtendable(args)) return checked;
      return method.apply(_, args);
    }, checker, match);
  },

  /**
   * Merges multiple objects or arrays into one.
   * @param {Array} args - Array of objects/arrays to merge
   * @returns {Array|Object}
   */
  merge: function(array) {
    if (arguments.length > 1) array = _.toArray(arguments);
    if (! _.isArray(array)) return array;
    array = _.compact(array);
    if ($fn.isArrayOf(array, 'array'))
      return _.flattenDeep(array);
    else if ($fn.isArrayOf(array, 'object'))
      return _.extend.apply(_, [{}].concat(array));
    return array;
  },

  /**
   * Transforms object
   * @param {Object} object
   * @param {Function} iteratee
   * @returns {Object}
   */
  transform: function(object, iteratee, thisArg) {
    thisArg = $val(thisArg, object);
    for (var key in object)
      object[key] = iteratee.call(thisArg, object[key], key, object);
    return object;
  },

  /**
   * Applies `method` on given `Class` with `scope` and passing `args`
   * @param {Function|Object} Class - Class to call
   * @param {string} method - method to call
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [scope] - scope to bind
   * @returns {*}
   */
  apply: function(Class, method, args, scope) {
    return $fn.applyFn($fn.class.resolveMethod(Class.prototype || Class, method, scope), args, scope);
  },

  /**
   * Applies function with the given arguments and scope
   * @param {Function} fn - function to apply
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [scope] - scope to bind to function
   * @returns {*}
   */
  applyFn: function(fn, args, scope) {
    if (! $isDef(args)) args = [];
    else args = ! _.isArguments(args) ? $fn.castArr(args) : args;
    if (_.isFunction(fn)) return fn.apply($val(scope, fn), args);
  },

  /**
   * Checks if given array is array with objects
   * @param {Array} array - Array to check
   * @param {string} of - String of type (object, string, array ...etc)
   * @param {?string} [method=every] Method to use to check if `every`, `any` or `some` conditions worked
   * @returns {*|boolean}
   */
  isArrayOf: function(array, of, method) {
    method = $val(method, 'every', _.isString);
    return _.isArray(array) && _[method](array, _['is' + _.capitalize(of)]);
  },

  /**
   * Casts `traversable` to array and run through it calling `cb` on each iteration.
   * You can provide `final` argument to return any result
   * @param {*} traversable
   * @param {Function} cb
   * @param {?Function|*} [final]
   * @param {?string} [method]
   * @param {?Object} [scope]
   * @returns {*}
   */
  multi: function(traversable, cb, final, method, scope) {
    final = $val(final, 'arrayFirstOrAll');
    var fn = _[$val(method, 'map')]
      , isMacros = _.isString(final) && $fn.macros.has(final)
      , finalFn = isMacros ? $fn.macros.create(final, traversable) : $fn.cast.toFunction(final)
      , result = $fn.applyFn(fn, [$fn.castArr($val(traversable, [])), cb], scope);
    return _.isFunction(final) ? $fn.applyFn(finalFn, [result, traversable]) : result;
  },

  /**
   * Checks if all values in array are the same
   * @param {Array} array
   * @returns {boolean}
   */
  inArrayAllSame: function(array) {
    return ! ! array.reduce(function(a, b) {
      return a === b ? a : NaN;
    });
  },

  /**
   * Concatenates arguments into one array,
   * if item is arguments it will be converted to array
   * @params {...args}
   * @returns {Array}
   */
  argsConcat: function() {
    var args = _.map(_.toArray(arguments), $fn.cast.toArray);
    return $fn.concat.apply([], args);
  },

  /**
   * Concatenates arguments into one array,
   * if item is arguments it will be converted to array
   * @param {number} level
   * @param {...args}
   * @returns {Array}
   */
  argsConcatFlat: function(level) {
    var concatenated = $fn.argsConcat.apply($fn, _.drop(arguments));
    return _.flattenDepth(concatenated, $val(level, 1, _.isNumber));
  },

  /**
   * Concatenates arrays into one.
   * If last argument is boolean then it will be used to determine,
   * if we need to make unique array.
   * @param {...args}
   * @returns {Array}
   */
  concat: function() {
    var makeUnique = $val(_.last(arguments), true, _.isBoolean);
    var args = Array.prototype.concat.apply([], _.toArray(arguments).map($fn.castArr));
    return makeUnique ? _.uniq(args) : args;
  },

  /**
   * Fills array with the given value
   * @param {Array} array
   * @param {*} value
   * @param {number} times
   * @returns {Array}
   */
  fill: function(array, value, times) {
    if (! _.isArray(array)) {
      times = $fn.cast.toNumber(array);
      array = [];
    }

    if (! _.isNumber(times)) times = array.length;
    var n = 0, hasValue = $isDef(value);
    while (n < times) {
      array.push(hasValue ? value : n);
      ++ n;
    }
    return array;
  },

  /**
   * Force object cast to array
   * @param {*} object
   * @returns {Array}
   */
  castArr: function(object) {
    if (_.isArray(object)) return object;
    if (_.isArguments(object)) return $fn.cast.toArray(object);
    return [object];
  },

  /**
   * Creates plain object with the given key and value,
   * or if key is Array then will zip object from keys and values
   * @param {string|Array} key
   * @param {*} value
   * @returns {Object}
   */
  createPlain: function(key, value) {
    var obj = {};

    if (_.isArray(key)) {
      value = $fn.castArr(value);
      return $fn.multi(key, function(one, index) {
        _.extend(obj, $fn.createPlain(one, value[index]));
      }, function() {return obj;}, 'each');
    }

    obj[key] = value;
    return obj;
  },

  /**
   * Copies properties from source object to destination object
   * @param {Object} source
   * @param {Object} destination
   * @param {Array} props
   * @param {?boolean} [deep=false]
   * @returns {*|Object}
   */
  copyProps: function(source, destination, props, deep) {
    var method = $val(deep, false, _.isBoolean) ? 'cloneDeep' : 'clone';
    for (var i = 0; i < props.length; i ++) if (_.has(source, props[i]))
      destination[props[i]] = _[method](source[props[i]]);
    return destination;
  },

  /**
   * Returns list of `object` methods
   * @param {Object} object
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  methods: function(object, exclude) {
    var name, methods = [];
    if (! _.isObject(object) || _.isArray(object)) return methods;
    for (name in object) if (_.isFunction(object[name])) methods.push(name);
    return ! _.isEmpty(exclude) ? _.difference(methods, $fn.castArr(exclude)) : methods;
  },

  /**
   * Returns list of `object` properties
   * @param {Object} object
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  properties: function(object, exclude) {
    if (! _.isObject(object) || _.isArray(object)) return methods;
    var properties = _.keys(_.omit(object, $fn.methods(object)));
    return ! _.isEmpty(exclude) ? _.difference(properties, $fn.castArr(exclude)) : properties;
  },

  /**
   * Clones `object` deep using `customizer`
   * @param {Object} object
   * @param {Function} customizer
   * @param {?Object} [scope]
   * @returns {Object}
   */
  cloneDeepWith: function(object, customizer, scope) {
    if (_.isObject(scope)) customizer = _.bind(customizer, scope);
    return _.cloneDeepWith(object, customizer);
  },

  /**
   * Clones `object` using `customizer`
   * @param {Object} object
   * @param {Function} customizer
   * @param {?Object} [scope]
   * @returns {Object}
   */
  cloneWith: function(object, customizer, scope) {
    var clone = {};
    $each(object, function(val, prop) {
      clone[prop] = customizer.call(scope, val, prop);
    });
    return clone;
  },

  /**
   * Clones object
   * @param {Object} object
   * @param {?boolean} [deep=false]
   */
  clone: function(object, deep) {
    return $fn[deep ? 'cloneDeepWith' : 'cloneWith'](object, $fn.cloneCustomizer);
  },

  /**
   * Creates provided `count` of clones for the given `object`
   * @param {Object} object
   * @param {?number} [count=1]
   * @param {?boolean} [deep=false]
   * @returns {Array}
   */
  clones: function(object, count, deep) {
    count = $val(count, 1);
    deep = $val(deep, false);
    var clones = [], cloneFn = $fn[deep ? 'cloneDeepWith' : 'cloneWith'];
    while (count --) clones.push(cloneFn(object, $fn.cloneCustomizer));
    return clones;
  },

  /**
   * Clone customizer function
   * @param {*} value
   * @returns {*}
   */
  cloneCustomizer: function(value) {
    if (_.isFunction(value)) return value;
    if (_.isArray(value)) return value.slice();
    return _.clone(value);
  },

  /**
   * Clones function
   * @param {Function} fn
   * @returns {Function}
   */
  cloneFunction: function(fn) {
    var temp = function() { return fn.apply(this, arguments); };
    _.forOwn(fn, function(value, prop) {
      temp[prop] = value;
    });
    return temp;
  },

  /**
   * Returns trimmed string or array of string
   * @param {string|Array} string
   * @param {?string} [delimiter]
   * @returns {Array}
   */
  trim: function(string, delimiter) {
    return _.map($fn.castArr(string), function(one) {
      return _.trim(one, delimiter || '');
    });
  },

  /**
   * Joins array of `strings` using `glue`.
   * You can provide as many arguments as you need, in this case `glue` will be the last one
   * @param {Array} strings
   * @param {string} glue
   * @returns {*|string}
   */
  join: function(strings, glue) {
    if (arguments.length > 2) {
      glue = _.last(arguments);
      strings = _.dropRight(arguments, 1);
    }

    return $fn.trim($fn.castArr(strings), glue).join(glue);
  },

  /**
   * Fires two events on object, first is simple event, second is event for attribute
   * @param {Object} object
   * @param {string} event
   * @param {string} attribute
   * @param {?Array} [args]
   * @param {?Function} [cb]
   */
  fireAttribute: function(object, event, attribute, args, cb) {
    var options = {prepare: false, call: false};
    event = _.trim(event, ':');
    attribute = _.trim(attribute, ':');
    args = $fn.prepareFireCallArgs({fire: args}, {fire: []});
    $fn.fireCall(object, event, args, options);
    var result = _.isFunction(cb) ? $fn.applyFn(cb, args) : void 0;
    $fn.fireCall(object, event + ':' + attribute, args, options);
    return result;
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires event
   * @param {Function|Object} Class - Class to call
   * @param {string} event - event to fire and transform to callback name
   * @param {?Object} [args]
   * @param {?Object} [options]
   * @return {*}
   */
  fireCall: function(Class, event, args, options) {
    var result = Class;
    options = _.defaults({}, options || {}, {prepare: true, call: true});
    if (options.prepare) args = $fn.prepareFireCallArgs(args, {fire: [], call: []});
    if (options.call) result = $fn.apply(Class, _.camelCase(event.split(':').join(' ')), args.call);
    $fn.apply(Class, 'fire', [event].concat(args.fire));
    return result;
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires event
   * @param {Function|Object} Class - Class to call
   * @param {string} event - event to fire and transform to callback name
   * @param {Function} callback
   * @param {?Object} [args]
   * @param {?Array} [lifeCycle]
   * @return {*}
   */
  fireCallCyclic: function(Class, event, callback, args, lifeCycle) {
    args = $fn.prepareFireCallArgs(args, {fire: [], call: [], callback: []})
    lifeCycle = $val(lifeCycle, ['before', '@callback', 'after'], [_.isArray, _.negate(_.isEmpty)]);

    var result;

    for (var i = 0; i < lifeCycle.length; i ++) {
      var now = lifeCycle[i]
        , nowEvent = $fn.makeEventName([now, event]);

      if (now === '@callback' && _.isFunction(callback)) result = callback.apply(Class, args.callback);
      else $fn.fireCall(Class, nowEvent, args, false);
    }

    return result;
  },

  /**
   * Makes single event from array of events
   * @param {Array} events
   * @param {?string} [delimiter=':']
   * @returns {string}
   */
  makeEventName: function(events, delimiter) {
    delimiter = $val(delimiter, ':', _.isString);
    return _.map($fn.castArr(events), function(event) {
      return _.isString(event) && $fn.trim(event, delimiter) || $fn.cast.toString(event);
    }).join(':');
  },

  /**
   * Returns wrapped `fireCallCyclic` method
   * @param {Function} fn
   * @param {string} event
   * @param {?Object} [args]
   * @param {?Array} [lifeCycle]
   * @returns {Function}
   */
  wrapFireCallCyclic: function(fn, event, args, lifeCycle) {
    return _.wrap(fn, _.bind(function(execFn) {
      return $fn.fireCallCyclic(this, event, execFn, args, lifeCycle);
    }, this));
  },

  /**
   * Prepares arguments for fire call methods
   * @param {Object} args
   * @param {?Object} [defaults={}]
   * @returns {*|Object|stream}
   */
  prepareFireCallArgs: function(args, defaults) {
    var prepared = $valMerge(args, defaults, 'defaults');
    for (var key in prepared) {
      var value = prepared[key];
      if (_.isArguments(value)) prepared[key] = value;
      else prepared[key] = $fn.castArr(value);
    }
    return prepared;
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  proto: function(exclude) {
    return _.omit($fn, $private($fn, 'protoExclude').concat($val(exclude, [], _.isArray)));
  },

  /**
   * Creates include function to determine
   * @param {Array} list
   * @returns {Function}
   */
  createIncludes: function(list) {
    return function(val) {
      return _.includes(list, val);
    };
  },

  /**
   * Assertion helper
   * @param {boolean} statement
   * @param {string} errorMsg
   * @throws Will throw `Error` if statement is not true
   */
  expect: function(statement, errorMsg) {
    if (! statement) throw new Error(errorMsg || 'Expected `statement` to be true');
  },

  /**
   * Expect that object has all given properties
   * @param {Object} obj
   * @param {Array|Object} props
   * @param [{boolean}] isObject - default to `true`
   */
  hasAllProps: function(obj, props) {
    var isObject = _.isArray(props) ? false : true;
    return _.every(props, function(prop, key) {
      var prop = isObject ? key : props[key];
      return isObject ? _.has(obj, prop) : _.includes(obj, prop);
    });
  },

  /**
   * Determines if object can be extended.
   * Check for `extend` function or if it's plain object
   * @param {*} object
   * @returns {boolean}
   */
  isExtendable: function(object) {
    if (arguments.length > 1) object = _.toArray(arguments);
    return _.every($fn.castArr(object), function(one) {
      return _.isObject(one) && (_.isFunction(one.extend) || _.isPlainObject(one));
    });
  },

  /**
   * Determines if it is not restricted to access the `method` of the given `object`
   * @param {Object} object
   * @param {string} method
   * @param {?string} [level]
   * @returns {boolean}
   */
  isAllowedToAccess: function(object, method, level) {
    level = $val(level, $Config.access.default, _.isString) || object[$Config.access.key];
    if (! _.isObject(object) || ! level) return true;
    var methods = _.get(object, '__allow.' + level);
    if (! _.isArray(methods)) return $fn.cast.toBoolean(methods);
    if (_.includes(methods, method)) return true;
    return false;
  },

  /**
   * Returns private object or key from object if exists
   * @param {Object} object
   * @param {?string} [key]
   * @param {?*} [value]
   * @returns {*}
   */
  private: function(object, key, value) {
    if (! _.isPlainObject(object)) return object;
    if (arguments.length === 2) return $fn.getPrivate(object, key);
    else if (arguments.length === 3)return $fn.setPrivate(object, key, value);
    else return $fn.getPrivate(object);
  },

  /**
   * Determines if key exists at the private configuration of object
   * @param {Object} object
   * @param {string} key
   * @returns {boolean}
   */
  hasPrivate: function(object, key) {
    return _.has(object, $fn.makePrivateKey(key));
  },

  /**
   * Sets private property to the given value.
   * @param {Object} object
   * @param {string} key
   * @param {*} value
   * @returns {Object}
   */
  setPrivate: function(object, key, value) {
    _.set(object, $fn.makePrivateKey(key), value);
    return object;
  },

  /**
   * Returns private property of the object.
   * @param {Object} object
   * @param {string} [key]
   * @returns {*}
   */
  getPrivate: function(object, key) {
    return _.get(object, $fn.makePrivateKey(key));
  },

  /**
   * Returns key transformed to private key.
   * Adds prefix to the key with the private object destination path.
   * @param {string} key
   * @returns {string|*}
   */
  makePrivateKey: function(key) {
    return $fn.join([$Config.private.key, key], '.');
  },
};

/**
 * Returns private object or key from object if exists
 * @param {Object} object
 * @param {?string} [key]
 * @param {?*} [value]
 * @returns {*}
 */
$private = $fn.private;

/**
 * Determines if key exists at the private configuration of object
 * @param {Object} object
 * @param {string} key
 * @returns {boolean}
 */
$privateHas = $fn.hasPrivate;

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
$fn.val.notDefined = $fn.__private.notDefined;

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 * @static
 */
$isDef = $fn.val.isDef = function(value) {
  if (! arguments.length) return false;
  return $fn.val(value) !== $fn.val.notDefined;
};

/**
 * Returns value if not undefined or null,
 * otherwise returns defaults or $__NULL__$ value
 * @see https://github.com/imkrimerman/im.val (npm version)
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {?Function|Function[]} [checker] - function to call to check validity
 * @param {?string} [match='every'] - function to use ('every', 'some')
 * @returns {*}
 */
$val = $fn.val;

/**
 * Applies `val` checker function and extends checked value with `extender` if allowed.
 * @param {*} value - value to check
 * @param {Object} extender - object to extend with
 * @param {?Function|string} [method=_.extend] - function to use to merge the objects (can be lodash method name or
 * function)
 * @param {?Function} [checker] - function to call to check validity
 * @param {?string} [match='every'] - function to use ('every', 'some')
 * @param {?boolean} [toOwn=false] - if true then sets extender directly to checked value,
 * otherwise creates new object and merges checked value with extender
 * @returns {Object|Function}
 */
$valMerge = $fn.valMerge;
