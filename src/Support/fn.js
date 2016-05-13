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
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided that defaults will be set to `null`.
   * @param {Object} object
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: function(object, property, defaults) {
    if (! _.isArray(property)) return _.get(object, property, defaults);
    return _.map(property, function(prop) {
      return $fn.get(object, prop);
    });
  },

  /**
   * Sets `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @param {*} value
   * @returns {*}
   */
  set: function(object, property, value) {
    if (! _.isArray(property)) _.set(object, property, value);
    else {
      var isValueArray = _.isArray(value);
      $each(property, function(prop, index) {
        $fn.set(object, prop, isValueArray ? value[index] : value);
      });
    }
    return object;
  },

  /**
   * Determine if Class has given `property`.
   * @param {Object} object
   * @param {string} property
   * @returns {boolean}
   */
  has: function(object, property) {
    if (! _.isArray(property)) return _.has(object, property);
    return _[(arguments.length >
              2 ?
              $val(arguments[2], 'every', _.isString) :
              'every')](property, function(prop) {
      return $fn.has(object, prop);
    });
  },

  /**
   * Gets value by the given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`.
   * @param {Object|function(...args)} object
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: function(object, property, defaults) {
    var isObject = _.isObject(object);
    if (_.isFunction(object)) return object(property, defaults, object);
    if (isObject) return _.result(object, property, defaults);
    else if (! isObject && ! _.isArray(property)) return object;
    return _.map($fn.castArr(property), function(prop) {
      return $fn.result(object, prop, defaults);
    });
  },

  /**
   * Alias for unset. Removes `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @returns {Object}
   */
  forget: function(object, property) {
    if (! _.isArray(property)) _.unset(object, property);
    else $each(property, function(prop) {
      $fn.forget(object, prop);
    });
    return object;
  },

  /**
   * Returns value if not undefined or null, otherwise returns defaults or $__NULL__$ value.
   * @see https://github.com/imkrimerman/im.val (npm version without current enhancements)
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {?function()|function()[]} [checker] - function to call to check validity
   * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
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
   * Validates value with the given checkers
   * @param {*} value - value to check
   * @param {Array|function()} checkers - function to call to check validity
   * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
   * @returns {boolean}
   */
  valCheck: function(value, checkers, match) {
    match = _.isString(match) ? match : 'any';
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
   * Returns `value` if `includes` array contains `value` or returns defaults otherwise.
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {Array|*} includes - array of values to check if the value is contained there
   * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
   * @returns {*}
   */
  valIncludes: function(value, defaults, includes, match) {
    if (includes == null) includes = ['every', 'some', 'any'];
    return $val(value, defaults, function(val) {
      return _.includes(includes, val);
    }, match);
  },

  /**
   * Applies `val` function and calls callback with result as first argument
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {function()} cb - callback to call after check
   * @param {?function()} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @returns {*}
   */
  valCb: function(value, defaults, cb, checker, match) {
    var val = $val(value, defaults, checker, match);
    if (! _.isFunction(cb)) return val;
    return cb(val);
  },

  /**
   * Applies `val` checker function and extends checked value with `extender` if allowed.
   * @param {*} value - value to check
   * @param {Object} extender - object to extend with
   * @param {?function()|string} [method=_.extend] - function to use to merge the objects (can be
   *                                               lodash method name or function)
   * @param {?function()} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @param {?boolean} [toOwn=false] - if true then sets extender directly to checked value,
   * otherwise creates new object and merges checked value with extender
   * @returns {Object|function()}
   */
  valMerge: function(value, extender, method, checker, match, toOwn) {
    method = $val(method, _.extend, [_.isFunction, _.isString]);
    if (_.isString(method) && $fn.has(_, method)) method = _[method];
    if (! $isDef(checker)) checker = _.isPlainObject;
    toOwn = $val(toOwn, false, _.isBoolean);
    return $fn.valCb(value, {}, function(checked) {
      var args = toOwn ? [checked, extender] : [{}, checked, extender];
      if (! $fn.isExtendable(args)) return checked;
      return method.apply(_, args);
    }, checker, match);
  },

  /**
   * Checks if value is defined
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isDef: function(value) {
    if (! arguments.length) return false;
    return $fn.val(value) !== $fn.val.notDefined;
  },

  /**
   * Merges multiple objects or arrays into one.
   * @param {Array} args - Array of objects/arrays to merge
   * @returns {Array|Object}
   */
  merge: function(array) {
    if (arguments.length > 1) array = _.toArray(arguments);
    if (! _.isArray(array)) return array;
    array = $fn.compact(array);
    if ($fn.isArrayOf(array, 'array')) return _.flattenDeep(array);
    if ($fn.isArrayOf(array, 'object')) return _.extend.apply(_, [{}].concat(array));
    return array;
  },

  /**
   * Applies `method` on given `Class` with `scope` and passing `args`
   * @param {function()|Object} Class - Class to call
   * @param {string} method - method to call
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [scope] - scope to bind
   * @returns {*}
   */
  apply: function(Class, method, args, scope) {
    return $fn.applyFn($fn.class.resolveMethod(Class, method, scope), args, scope);
  },

  /**
   * Applies function with the given arguments and scope
   * @param {function(): *} fn - function to apply
   * @param {?Array} [args] - arguments to pass
   * @param {Object|Array} [scope] - scope to bind to function
   * @returns {*}
   */
  applyFn: function(fn, args, scope) {
    if (! $isDef(args)) args = [];
    else args = ! _.isArguments(args) ? $fn.castArr(args) : args;
    if (_.isFunction(fn)) return fn.apply($val(scope, fn), args);
  },

  /**
   * Expect that object has all given properties
   * @param {Object} obj
   * @param {Array|Object} props
   * @param {boolean} [isObject=true]
   */
  hasAllProps: function(obj, props) {
    var isObject = _.isArray(props) ? false : true;
    return _.every(props, function(prop, key) {
      var prop = isObject ? key : props[key];
      return isObject ? $fn.has(obj, prop) : _.includes(obj, prop);
    });
  },

  /**
   * Checks if given array is array with objects
   * @param {Array} array - Array to check
   * @param {string} of - String of type (object, string, array ...etc)
   * @param {?string} [method=every] Method to use to check if `every`, `any` or `some` conditions
   *   worked
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
    return ! ! array.reduce(function(a, b) { return a === b ? a : NaN; });
  },

  /**
   * Casts `traversable` to array and run through it calling `cb` on each iteration.
   * You can provide `final` argument to return any result
   * @param {*} traversable
   * @param {function()} cb
   * @param {?function()|*} [final]
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
    return _.isFunction(finalFn) ? $fn.applyFn(finalFn, [result, traversable]) : result;
  },

  /**
   * Concatenates arguments into one array, if item is arguments it will be converted to array
   * @param {number} level
   * @param {...args}
   * @returns {Array}
   */
  argsConcatFlat: function(level) {
    var concatenated = $fn.argsConcat.apply($fn, _.drop(arguments));
    return _.flattenDepth(concatenated, $val(level, 1, _.isNumber));
  },

  /**
   * Concatenates arguments into one array, if item is arguments it will be converted to array
   * @params {...args}
   * @returns {Array}
   */
  argsConcat: function() {
    var args = _.map(_.toArray(arguments), $fn.cast.toArray);
    return $fn.concat.apply([], args);
  },

  /**
   * Concatenates arrays into one.
   * If last argument is boolean then it will be used to determine, if we need to make unique array.
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
    var obj = {}, isValueArray = _.isArray(value);
    if (_.isArray(key)) return $fn.multi(key, function(one, index) {
      _.extend(obj, $fn.createPlain(one, isValueArray ? value[index] : value));
    }, function() {return obj;}, 'each');
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
    for (var i = 0; i < props.length; i ++) if ($fn.has(source, props[i]))
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
    return ! _.isEmpty(exclude) ? _.without(methods, $fn.castArr(exclude)) : methods;
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
   * @param {function()} customizer
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
   * @param {function()} customizer
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
   * @param {function()} [cloneIterator]
   */
  clone: function(object, deep, cloneIterator) {
    return $fn[deep ? 'cloneDeepWith' : 'cloneWith'](object, $val(cloneIterator, function(value) {
       if (_.isFunction(value)) return value;
       if (_.isArray(value)) return value.slice();
       return _.clone(value);
     }, _.isFunction));
  },

  /**
   * Returns trimmed string or array of string
   * @param {string|Array} string
   * @param {?string} [delimiter]
   * @returns {Array}
   */
  trim: function(string, delimiter) {
    var trimmed = _.map($fn.castArr(string), function(one) {
      return _.trim(one, delimiter || '');
    });
    return _.isArray(string) ? trimmed : _.first(trimmed);
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

    return $fn.trim($fn.compact($fn.castArr(strings)), glue).join(glue);
  },

  /**
   * Creates function that returns `value`
   * @param {*} value
   * @returns {function()}
   */
  constant: function(value) {
    return function() {return value;};
  },

  /**
   * Removes all falsey values from array.
   * Falsey values `false`, `null`, `0`, `""`, `undefined`, and `NaN`.
   * @param {Array} array
   * @returns {Array}
   */
  compact: function(array) {
    var i = - 1, index = 0, result = []
      , length = (array = $fn.castArr(array)) ? array.length : 0;
    while (++ i < length) if (array[i]) result[index ++] = array[i];
    return result;
  },

  /**
   * Fires two events on object, first is simple event, second is event for attribute
   * @param {Object} object
   * @param {string} event
   * @param {string} attribute
   * @param {?Array} [args]
   * @param {?function()} [cb]
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
   * @param {function()|Object} Class - Class to call
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
   * @param {function()|Object} Class - Class to call
   * @param {string} event - event to fire and transform to callback name
   * @param {function()} callback
   * @param {Object} [args]
   * @param {Array} [lifeCycle]
   * @return {*}
   */
  fireCallCyclic: function(Class, event, callback, args, lifeCycle) {
    args = $fn.prepareFireCallArgs(args, {fire: [], call: [], callback: []})
    lifeCycle = $val(lifeCycle, ['before', '@callback', 'after'], [_.isArray, _.negate(_.isEmpty)]);

    var result;
    for (var i = 0; i < lifeCycle.length; i ++) {
      var now = lifeCycle[i], nowEvent = Fiber.Events._joinEventName([now, event]);
      if (now === '@callback') {
        if (_.isFunction(callback)) result = callback.apply(Class, args.callback);
        nowEvent = event;
      }
      $fn.fireCall(Class, nowEvent, args, {prepare: false});
    }

    return result;
  },

  /**
   * Returns wrapped `fireCallCyclic` method
   * @param {function()} fn
   * @param {string} event
   * @param {Object} [args]
   * @param {Array} [lifeCycle]
   * @returns {function()}
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
   * @returns {Object}
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
   * Assertion helper
   * @param {boolean} statement
   * @param {string} errorMsg
   * @throws Will throw `Error` if statement is not true
   */
  expect: function(statement, errorMsg) {
    if (! statement) throw new Error(errorMsg || 'Expected `statement` to be true');
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
   * Serializes object to string representation
   * @param {Object} object
   * @returns {string}
   */
  serialize: function(object) {
    var isArray = _.isArray(object)
      , prepared = isArray ? [] : {};
    if (_.isFunction(object)) return Fiber.Types.Function.getSignature() + object.toString();
    $each(object, function(value, prop) {
      if (_.isObject(value) || _.isFunction(value)) value = $fn.serialize(value);
      isArray ? prepared.push(value) : (prepared[prop] = value);
    });
    return JSON.stringify(prepared);
  },

  /**
   * Un serializes string representation to object
   * @param {string} string
   * @returns {Object}
   */
  unserialize: function(string) {
    string = $fn.trim(string);
    var signature = Fiber.Types.Function.getSignature()
      , isArray = _.isArray(object)
      , prepared = isArray ? [] : {};
    if (_.startsWith(string, signature)) return new Function('return ' + string.replace(signature, ''));
    if (string[0] === '{' || string[0] === '[') {
      var parsed = JSON.parse(string);
      $each(parsed, function(value, prop) {
        if (! _.isString(value) || ! _.startsWith(string, signature)) return;
        value = $fn.unserialize(value);
        isArray ? prepared.push(value) : (prepared[prop] = value);
      });
      return prepared;
    }
    return JSON.parse(string);
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
  isAllowedToCall: function(object, method, level) {
    level = $val(level, $PropNames.access.default, _.isString) || object[$PropNames.access.key];
    if (! _.isObject(object) || ! level) return true;
    var methods = $fn.get(object, '_accessRules.' + level);
    if (! _.isArray(methods)) return $fn.cast.toBoolean(methods);
    if (_.includes(methods, method)) return true;
    return false;
  }
};

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 * @static
 */
$isDef = $fn.val.isDef = $fn.isDef;

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
$fn.val.notDefined = $fn.notDefined;

/**
 * Returns value if not undefined or null,
 * otherwise returns defaults or $_NULL_$ value
 * @see https://github.com/imkrimerman/im.val (npm version)
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {?function()|function()[]} [checker] - function to call to check validity
 * @param {?string} [match='every'] - function to use ('every', 'some')
 * @returns {*}
 */
$val = $fn.val;

/**
 * Applies `val` checker function and extends checked value with `extender` if allowed.
 * @param {*} value - value to check
 * @param {Object} extender - object to extend with
 * @param {?function()|string} [method=_.extend] - function to use to merge the objects (can be
 *   lodash method name or function)
 * @param {?function()} [checker] - function to call to check validity
 * @param {?string} [match='every'] - function to use ('every', 'some')
 * @param {?boolean} [toOwn=false] - if true then sets extender directly to checked value,
 * otherwise creates new object and merges checked value with extender
 * @returns {Object|function()}
 */
$valMerge = $fn.valMerge;

/**
 * Returns `value` if `includes` array contains `value` or returns defaults otherwise.
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {Array|*} includes - array of values to check if the value is contained there
 * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {*}
 */
$valIncludes = $fn.valIncludes;
