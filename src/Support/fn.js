/**
 * Fiber support function
 * @type {Object}
 */
$fn = Fiber.fn = {

  /**
   * List of properties to exclude when mixin functions to Class prototype
   * @type {Array}
   */
  protoExclude: ['proto', 'protoExclude'],

  /**
   * Value that represents not defined state.
   * @type {string}
   */
  notDefined: '$__NULL__$',

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
    defaults = arguments.length > 1 ? defaults : $fn.notDefined;
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
    var args = _.toArray(arguments);
    for (var i = 0; i < args.length; i ++)
      if (_.isArguments(args[i])) args[i] = _.toArray(args[i]);
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
    if (! _.isArray(array) && _.isNumber(array)) {
      times = array;
      array = [];
    }

    if (! _.isNumber(times) || ! times) return array;
    var n = 0, hasValue = $isDef(value);
    while (n < times) {
      array.push(hasValue ? value : n);
      ++n;
    }
    return array;
  },

  /**
   * Force object cast to array
   * @param {Object} object
   * @returns {Array}
   */
  castArr: function(object) {
    return $fn.cast.toArray(object);
  },

  /**
   * Creates plain object with the given key and value
   * @param {string} key
   * @param {*} value
   * @returns {Object}
   */
  createPlain: function(key, value) {
    var obj = {};
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
   * @returns {Array}
   */
  methods: function(object) {
    var name, methods = [];
    if (! _.isObject(object) || _.isArray(object)) return methods;
    for (name in object) if (_.isFunction(object[name])) methods.push(name);
    return methods;
  },

  /**
   * Returns list of `object` properties
   * @param {Object} object
   * @returns {Array}
   */
  properties: function(object) {
    if (! _.isObject(object) || _.isArray(object)) return methods;
    return _.keys(_.omit(object, $fn.methods(object)));
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
      clone[prop] = customizer.call(scope, null, val, prop);
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
    while (count--) clones.push(cloneFn(object, $fn.cloneCustomizer));
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
   * Fires two events on object, first is simple event, second is event for attribute
   * @param {Object} object
   * @param {string} event
   * @param {string} attribute
   * @param {?Array} [args]
   */
  fireAttribute: function(object, event, attribute, args) {
    var options = {prepare: false, call: false};
    event = _.trim(event, ':');
    attribute = _.trim(attribute, ':');
    args = $fn.prepareFireCallArgs({fire: args}, {fire: []});
    $fn.fireCall(object, event, args, options);
    $fn.fireCall(object, event + ':' + attribute, args, options);
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
    return _.map($fn.castArr(events), function(event) {
      return _.isString(event) && _.trim(event, $val(delimiter, ':', _.isString)) || $fn.cast.toString(event);
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
    return _.omit($fn, $fn.protoExclude.concat($val(exclude, [], _.isArray)));
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
    level = $val(level, null, _.isString) || object[$Const.access.private];
    if (! _.isObject(object) || ! level) return true;
    var methods = $Const.access.allow[level];
    if (! _.isArray(methods)) return !! methods;
    if (_.includes(methods, method)) return false;
    return true;
  },

  /**
   * Returns state key for the given object with path appended
   * @param {Object} object
   * @param {?string} [path='']
   * @returns {string}
   */
  getStateKey: function(object, path) {
    path = $val(path, '', _.isString);
    if (! $fn.hasStateKey(object)) return path;
    return _.trim(object[$Const.state.private]) + '.' + _.trim(path, '.');
  },

  /**
   * Determines if object has state key
   * @param {Object} object
   * @param {?string} [path='']
   * @returns {boolean}
   */
  hasStateKey: function(object) {
    if (_.has(object, $Const.state.private)) return true;
    return false;
  },

  /**
   * Returns state container of the given object
   * @param {Object} object
   * @param {?string} [path='']
   * @param {*} [defaults]
   * @returns {*}
   */
  getState: function(object, path, defaults) {
    var key = $fn.getStateKey(object, path);
    return Fiber.state.get(key, defaults);
  },

  /**
   * Returns state container of the given object
   * @param {Object} object
   * @param {?string} [path='']
   * @param {*} [defaults]
   * @returns {*}
   */
  setState: function(object, path, value) {
    var key = $fn.getStateKey(object, path);
    return Fiber.state.set(key, value);
  },

  /**
   * Determines if object has state
   * @param {Object} object
   * @param {?string} [path='']
   * @returns {boolean}
   */
  hasState: function(object, path) {
    if (! $fn.hasStateKey(object) || ! Fiber.state.has($fn.getStateKey(object, path))) return false;
    return true;
  },
};

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
$fn.val.notDefined = $fn.notDefined;

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 * @static
 */
$isDef = $fn.val.isDef = function(value) {
  if (! arguments.length) return false;
  return $fn.val(value) !== $fn.notDefined;
};

/**
 * @inheritDoc
 */
$val = $fn.val;

/**
 * @inheritDoc
 */
$valMerge = $fn.valMerge;

_.extend($Const.template.imports, {$fn: $fn, $val: $val, $each: $each});
