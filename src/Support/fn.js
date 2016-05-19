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
   * Gets value by given `property` key. You can provide `defaults` value that
   * will be returned if value is not found by the given key. If `defaults` is
   * not provided then `null` will be returned.
   * @param {Object} object
   * @param {string} property
   * @param {?*} [defaults]
   * @returns {*}
   */
  get: $get,

  /**
   * Sets `value` by given `property` key.
   * @param {Object} object
   * @param {string} property
   * @param {*} value
   * @returns {Object}
   */
  set: $set,

  /**
   * Determine if `object` has given `property`.
   * @param {Object} object
   * @param {string} property
   * @returns {boolean}
   */
  has: $has,

  /**
   * Determines if `object` has all given props.
   * @param {Object} object
   * @param {string|Array} props
   * @param {function(arg): boolean} [checkFn]
   * @returns {boolean}
   */
  hasGiven: $hasGiven,

  /**
   * Gets value by the given `property` key, if `property` value is function then it will be called.
   * You can provide `defaults` value that will be returned if value is not found
   * by the given key. If `defaults` is not provided that defaults will be set to `null`.
   * @param {Object|function(...args)} object
   * @param {string} property
   * @param {*} defaults
   * @returns {*}
   */
  result: $result,

  /**
   * Removes `value` by the given `property` key.
   * @param {Object} object
   * @param {string} property
   * @returns {Object}
   */
  forget: $forget,

  /**
   * The bind function is an addition to ECMA-262, 5th edition; as such it may not be present in all browsers.
   * You can partially work around this by inserting the following code at the beginning of your scripts,
   * allowing use of much of the functionality of bind() in implementations that do not natively support it.
   * @param {Object} scope
   * @param {...args}
   * @returns {function(...)}
   */
  bind: $bind,

  /**
   * Force object cast to array
   * @param {*} object
   * @returns {Array}
   */
  castArr: $castArr,

  /**
   * Clones object
   * @param {Object} object
   * @param {?boolean} [deep=false]
   * @param {function(...)} [cloneIterator]
   */
  clone: $clone,

  /**
   * A no-operation function that returns undefined regardless of the arguments it receives.
   * @returns {void}
   */
  noop: $noop,

  /**
   * Returns value if not undefined or null, otherwise returns defaults or $__NULL__$ value.
   * @see https://github.com/imkrimerman/im.val (npm version without current enhancements)
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {?function(...)|function(...)[]} [checker] - function to call to check validity
   * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
   * @returns {*}
   */
  val: $val,

  /**
   * Validates value with the given checkers
   * @param {*} value - value to check
   * @param {Array|function(...)} checkers - function to call to check validity
   * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
   * @returns {boolean}
   */
  valCheck: $valCheck,

  /**
   * Returns `value` if `includes` array contains `value` or returns defaults otherwise.
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {Array|Object} [includes] - array of values to check if the value is contained there
   * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
   * @returns {*}
   */
  valIncludes: $valIncludes,

  /**
   * Applies `val` function and calls callback with result as first argument
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {function(...)} cb - callback to call after check
   * @param {?function(...)} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @returns {*}
   */
  valCb: $valCb,

  /**
   * Applies `val` checker function and extends checked value with `extender` if allowed.
   * @param {*} value - value to check
   * @param {Object} extender - object to extend with
   * @param {?function(...)|string} [method=_.extend] - function to use to merge the objects (can be
   *                                               lodash method name or function)
   * @param {?function(...)} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @param {?boolean} [toOwn=false] - if true then sets extender directly to checked value,
   * otherwise creates new object and merges checked value with extender
   * @returns {Object|function(...)}
   */
  valMerge: $valMerge,

  /**
   * Creates function that returns `value`.
   * @param {*} value
   * @returns {function(...)}
   */
  constant: $constant,

  /**
   * Passes `value` through.
   * @param {*} value
   * @returns {*}
   */
  through: $through,

  /**
   * Removes all falsey values from array.
   * Falsey values `false`, `null`, `0`, `""`, `undefined`, and `NaN`.
   * @param {Array} array
   * @returns {Array}
   */
  compact: $compact,

  /**
   * Assertion helper
   * @param {boolean} statement
   * @param {string} errorMsg
   * @throws Will throw `Error` if statement is not true
   */
  expect: $expect,

  /**
   * Returns function that will create unique IDs.
   * @param {string} [name]
   * @returns {Function}
   */
  idGeneratorFor: $idGeneratorFor,

  /**
   * Checks if given array is array with objects
   * @param {string} of - String of type (object, string, array ...etc)
   * @param {Array} array - Array to check
   * @param {?string} [method=every] Method to use to check if `every`, `any` or `some` conditions
   *   worked
   * @returns {*|boolean}
   */
  isArrayOf: $isArrayOf,

  /**
   * Checks if value is defined
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isDef: $isDef,

  /**
   * Determines if object can be extended.
   * Check for `extend` function or if it's plain object
   * @param {*} object
   * @returns {boolean}
   */
  isExtendable: $isExtendable,


  /**
   * Returns what user agent is currently detected
   * @returns {string|null}
   */
  whatBrowser: $whatBrowser,

  /**
   * Determines if given `object` has `Fiber.Events`.
   * @param {Object} object
   * @returns {boolean}
   */
  isEventable: $isEventable,

  /**
   * Merges multiple objects or arrays into one.
   * @param {Array|*} mergeable - Array of objects/arrays to merge
   * @param {...args}
   * @returns {Array|Object}
   */
  merge: function(mergeable) {
    if (arguments.length > 1) mergeable = $slice(arguments);
    return $squash('extend', mergeable);
  },

  /**
   * Merges multiple objects or arrays into one.
   * @param {Array|*} mergeable - Array of objects/arrays to merge
   * @param {...args}
   * @returns {Array|Object}
   */
  deepMerge: function(mergeable) {
    if (arguments.length > 1) mergeable = $slice(arguments);
    return $squash('merge', mergeable);
  },

  /**
   * Applies `method` on given `Class` with `scope` and passing `args`
   * @param {function(...)|Object} Class - Class to call
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
   * @param {function(...): *} fn - function to apply
   * @param {?Array} [args] - arguments to pass
   * @param {Object|Array} [scope] - scope to bind to function
   * @returns {*}
   */
  applyFn: function(fn, args, scope) {
    args = ! $isDef(args) ? [] : $castArr(args);
    if ($isFn(fn)) return fn.apply($val(scope, fn.prototype), args);
  },

  /**
   * Returns function that will be called with the given `scope`.
   * If `argCount` provided then will slice arguments to the count that needs to be passed to the function.
   * @param {function(...)|Function} fn
   * @param {Object|null} [scope]
   * @param {Array|*} [partials]
   * @param {number} [argCount]
   * @returns {Function}
   */
  proxy: function(fn, scope, partials, argCount) {
    return function() {
      var args = $fn.cast.toArray(partials).concat($castArr(arguments))
        , pass = args.slice(0, $val(argCount, Infinity, $isNum));
      return fn.apply($val(scope, this), pass);
    };
  },

  /**
   * Returns function that will be called with given `scope` and appended `partials`, passing `this` as first argument.
   * @param {function(...)|Function} fn
   * @param {Object|null} [scope]
   * @param {Array|*} [partials]
   * @returns {Function}
   */
  delegate: function(fn, scope, partials) {
    return function() {
      var args = [this].concat($fn.cast.toArray(partials)).concat($castArr(arguments));
      return fn.apply($val(scope, this), args);
    };
  },

  /**
   * Tries to call `callable`.
   * If any Error will be thrown then it will intercepted and silent.
   * @param {function(...)} callable
   * @param {...args}
   * @returns {Error|*}
   */
  try: function(callable) {
    try { return callable.apply(callable, $drop(arguments)); }
    catch (e) { return e; }
  },

  /**
   * Tries to call `callable` with `onFail` hook.
   * If any Error will be thrown then it will intercepted and silent.
   * @param {function(...)} callable
   * @param {Array|Arguments} args
   * @param {function(...)} onFail
   * @returns {Error|*}
   */
  tryFail: function(callable, args, onFail) {
    var attempt = $fn.try.apply(null, $fn.argsConcat(callable, args));
    return _.isError(attempt) ? ($isFn(onFail) && onFail(e, args, callable) || onFail) : attempt;
  },

  /**
   * Expect that object has all given properties
   * @param {Object} object
   * @param {Array|Object} props
   * @param {boolean} [isObject=true]
   */
  hasAllProps: function(object, props) {
    if ($isPlain(props)) props = _.keys(props);
    return $hasGiven(object, props);
  },

  /**
   * Checks if all values in array are the same
   * @param {Array} array
   * @param {function(...)|Function} [sameCheckFn]
   * @returns {boolean}
   */
  inArrayAllSame: function(array, sameCheckFn) {
    return $fn.cast.toBoolean(array.reduce(function(a, b) {
      var condition = $isFn(sameCheckFn) && sameCheckFn(a, b) || a === b;
      return condition ? a : NaN;
    }));
  },

  /**
   * Casts `traversable` to array and run through it calling `cb` on each iteration.
   * You can provide `final` argument to return any result
   * @param {*} traversable
   * @param {function(...)} iterator
   * @param {?function(...)|*} [final]
   * @param {?string} [method]
   * @param {?Object} [scope]
   * @returns {*}
   */
  multi: function(traversable, iterator, final, method, scope) {
    traversable = $castArr($val(traversable, []));

    final = $val(final, function(object) {
      return function(result) {
        return $isArr(object) ? result : _.first(result);
      };
    }, [$isStr, $isFn]);

    if ($isStr(final) && $has(Fiber, final)) final = $get(Fiber, final);
    var result = $fn.applyFn(_[$val(method, 'map')], [traversable, iterator], scope);
    return $isFn(final) ? $fn.applyFn(final, [result, traversable, method, scope]) : result;
  },

  /**
   * Concatenates arguments into one array, if item is arguments it will be converted to array
   * @params {...args}
   * @returns {Array}
   */
  argsConcat: function() {
    var args = _.map(_.toArray(arguments), $castArr);
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
    var args = Array.prototype.concat.apply([], _.toArray(arguments).map($castArr));
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
    var i = 0, hasValue = $isDef(value);
    if (! $isArr(array)) {
      times = $fn.cast.toNumber(array);
      array = [];
    }

    if (! $isNum(times)) times = array.length;
    while (i < times) array.push(hasValue ? value : i ++);
    return array;
  },

  /**
   * Creates plain object with the given key and value,
   * or if key is Array then will zip object from keys and values
   * @param {string|Array} key
   * @param {*} value
   * @returns {Object}
   */
  createPlain: function(key, value) {
    var obj = {}, isValueArray = $isArr(value);
    if (! $isArr(key)) obj[key] = value;
    else $each(key, function(one, index) {
      _.extend(obj, $fn.createPlain(one, isValueArray ? value[index] : value));
    });
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
    for (var i = 0; i < props.length; i ++) if ($has(source, props[i]))
      destination[props[i]] = _[method](source[props[i]]);
    return destination;
  },

  /**
   * Returns list of `object` methods
   * @param {Object} object
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  methods: function(object, exclude, own) {
    var methods = own ? _.functions(object) : _.functionsIn(object);
    return _.isEmpty(exclude) ? methods : _.without(methods, $castArr(exclude));
  },

  /**
   * Returns list of `object` properties
   * @param {Object} object
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  properties: function(object, exclude) {
    if (! $isObj(object) || $isArr(object)) return methods;
    var properties = _.keys(_.omit(object, $fn.methods(object)));
    return _.isEmpty(exclude) ? properties : _.without(properties, $castArr(exclude));
  },

  /**
   * Returns trimmed string or array of string
   * @param {string|Array} string
   * @param {?string} [delimiter]
   * @returns {Array}
   */
  trim: function(string, delimiter) {
    var trimmed = _.map($castArr(string), function(one) {
      return _.trim(one, delimiter || '');
    });
    return $isArr(string) ? trimmed : _.first(trimmed);
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

    return $fn.trim($fn.compact($castArr(strings)), glue).join(glue);
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  proto: function(exclude) {
    return _.omit($fn, $fn.protoExclude.concat($val(exclude, [], $isArr)));
  },

  /**
   * Returns Sibling of the given Model if in collection or same Model.
   * @param {Object.<Backbone.Model>|Object.<Fiber.Model>} model
   * @param {?Object} [options={}] direction: next, - direction to search, can be 'next' or 'prev'
   *                               where: null, - options object to find model by, will be passed to
   *                                      the `collection.where`
   *                               defaultCid: null - if no model cid found will be used as default Model cid
   * @returns {Object.<Backbone.Model>|Object.<Fiber.Model>}
   */
  modelSibling: function(model, options) {
    if (! model.collection) return model;
    options = _.defaults(options || {}, { direction: 'next', where: null, defaultCid: null });
    var dirCid, cid = model.cid, models = options.where ?
                                          model.collection.where(options.where) :
                                          model.collection.models;

    if (models.length) dirCid = _.first(models).cid;
    else dirCid = options.defaultCid;

    for (var key = 0; key < models.length; key ++) {
      var model = models[key];
      if (model.cid !== cid) continue;
      if (options.direction === 'next') {
        if (key + 1 >= models.length) dirCid = _.first(models).cid;
        else dirCid = models[key + 1].cid;
        break;
      }
      else if (options.direction === 'prev') {
        if (key - 1 < 0) dirCid = _.last(models).cid;
        else dirCid = models[key - 1].cid;
        break;
      }
    }

    return dirCid != null ? model.collection.get(dirCid) : model;
  },

  /**
   * Fires two events on object, first is simple event, second is event for attribute
   * @param {Object} object
   * @param {string} event
   * @param {string} attribute
   * @param {?Array} [args]
   * @param {?function(...)} [cb]
   */
  fireAttribute: function(object, event, attribute, args, cb) {
    var options = { prepare: false, call: false };
    event = _.trim(event, ':');
    attribute = _.trim(attribute, ':');
    args = $fn.prepareFireCallArgs({ fire: args });
    $fn.fireCall(object, event, args, options);
    var result = $isFn(cb) ? $fn.applyFn(cb, args) : void 0;
    $fn.fireCall(object, event + ':' + attribute, args, options);
    return result;
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires event
   * @param {function(...)|Object} object - object to call
   * @param {string} event - event to fire and transform to callback name
   * @param {Object|Array|Arguments} [args]
   * @param {Object} [options]
   * @return {*}
   */
  fireCall: function(object, event, args, options) {
    options = $valMerge(options, {prepare: true, callEventMethod: true, methodPrefix: 'when', fireMethod: 'fire'});
    if ($isArr(event)) event = Fiber.Events.joinEventName(event);
    var result = object, methodName = _.camelCase(Fiber.Events.joinEventName([options.methodPrefix, event]));
    if (options.prepare || $isArr(args) || $isArgs(args)) args = $fn.prepareFireCallArgs(args);
    if (options.callEventMethod) result = $fn.apply(object, methodName, args.call);
    $fn.apply(object, options.fireMethod, [event].concat(args.fire));
    return result;
  },

  /**
   * Fires lifecycle events, invokes callback and if event method (camel case transformed event) exists will invoke it.
   * @param {function(...)|Object} object - object to call
   * @param {string} event - event to fire and transform to callback name
   * @param {function(...)} callback
   * @param {Object|Array|Arguments} [args]
   * @param {Object} [options]
   * @return {*}
   */
  fireCallCyclic: function(object, event, callback, args, options) {
    args = $fn.prepareFireCallArgs(args);
    options = $valMerge(options, {lifeCycle: ['before', '@callback', 'after'], prepare: false, callEventMethod: true});
    var hasCallback = $isFn(callback), result;
    for (var i = 0; i < options.lifeCycle.length; i ++) {
      var now = options.lifeCycle[i];
      if (now === '@callback' && hasCallback) result = callback.apply(object, args.callback);
      $fn.fireCall(object, [now, event], args, $fn.merge(options, {methodPrefix: now}));
    }
    return result;
  },

  /**
   * Returns wrapped `fireCallCyclic` method
   * @param {function(...)} fn
   * @param {string} event
   * @param {Object|Array|Arguments} [args]
   * @param {Object} [options]
   * @returns {function(...)}
   */
  createFireCallCyclic: function(fn, event, args, options) {
    options = $valMerge(options, {ignoreArguments: true});
    return function() {
      if (! options.ignoreArguments) args = $valMerge(args, {callback: arguments}, 'extend');
      return $fn.fireCallCyclic(this, event, fn, args, options);
    };
  },

  /**
   * Prepares arguments for fire call methods
   * @param {Object|Array|Arguments} args
   * @returns {Object}
   */
  prepareFireCallArgs: function(args) {
    if ($isArr(args) || $isArgs(args)) args = {fire: args, call: args, callback: args};
    var prepared = $valMerge(args, {fire: [], call: [], callback: []});
    for (var key in prepared) {
      var value = prepared[key];
      if ($isArgs(value)) prepared[key] = value;
      else prepared[key] = $castArr(value);
    }
    return prepared;
  }
};
