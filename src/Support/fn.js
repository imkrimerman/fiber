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
    if (_.isFunction(fn)) return fn.apply($val(scope, fn), args);
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
        , pass = args.slice(0, $val(argCount, Infinity, _.isNumber));
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
    try { return callable.apply(callable, _.drop(arguments)); }
    catch (e) { return e; }
    ;
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
    return _.isError(attempt) ? (_.isFunction(onFail) && onFail(e, args, callable) || onFail) : attempt;
  },

  /**
   * Expect that object has all given properties
   * @param {Object} obj
   * @param {Array|Object} props
   * @param {boolean} [isObject=true]
   */
  hasAllProps: function(obj, props) {
    props = _.isPlainObject(props) ? _.keys(props) : $castArr(props);
    return _.every(props, function(prop) {
      return $has(obj, prop);
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
   * @param {function(...)|Function} [sameCheckFn]
   * @returns {boolean}
   */
  inArrayAllSame: function(array, sameCheckFn) {
    return $fn.cast.toBoolean(array.reduce(function(a, b) {
      var condition = _.isFunction(sameCheckFn) && sameCheckFn(a, b) || a === b;
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
        return _.isArray(object) ? result : _.first(result);
      };
    }, [_.isString, _.isFunction]);

    if (_.isString(final)) {
      if ($fn.macros.has(final)) final = $fn.macros.create(final, traversable);
      if ($has(Fiber, final)) final = $get(Fiber, final);
    }

    var result = $fn.applyFn(_[$val(method, 'map')], [traversable, iterator], scope);
    return _.isFunction(final) ? $fn.applyFn(final, [result, traversable, method, scope]) : result;
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
    if (! _.isArray(array)) {
      times = $fn.cast.toNumber(array);
      array = [];
    }

    if (! _.isNumber(times)) times = array.length;
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
    var obj = {}, isValueArray = _.isArray(value);
    if (! _.isArray(key)) obj[key] = value;
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
  methods: function(object, exclude) {
    var name, methods = [];
    if (! _.isObject(object) || _.isArray(object)) return methods;
    for (name in object) if (_.isFunction(object[name])) methods.push(name);
    return ! _.isEmpty(exclude) ? _.without(methods, $castArr(exclude)) : methods;
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
    return ! _.isEmpty(exclude) ? _.difference(properties, $castArr(exclude)) : properties;
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

    return $fn.trim($fn.compact($castArr(strings)), glue).join(glue);
  },

  /**
   * Creates function that returns `value`.
   * @param {*} value
   * @returns {function(...)}
   */
  constant: function(value) {
    return function() {return value;};
  },

  /**
   * Passes `value` through.
   * @param {*} value
   * @returns {*}
   */
  through: function(value) {
    return value;
  },

  /**
   * Removes all falsey values from array.
   * Falsey values `false`, `null`, `0`, `""`, `undefined`, and `NaN`.
   * @param {Array} array
   * @returns {Array}
   */
  compact: function(array) {
    var i = - 1, index = 0, result = []
      , length = (array = $castArr(array)) ? array.length : 0;
    while (++ i < length) if (array[i]) result[index ++] = array[i];
    return result;
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
    args = $fn.prepareFireCallArgs({ fire: args }, { fire: [] });
    $fn.fireCall(object, event, args, options);
    var result = _.isFunction(cb) ? $fn.applyFn(cb, args) : void 0;
    $fn.fireCall(object, event + ':' + attribute, args, options);
    return result;
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires event
   * @param {function(...)|Object} object - object to call
   * @param {string} event - event to fire and transform to callback name
   * @param ?Object} [args]
   * @param {?Object} [options]
   * @return {*}
   */
  fireCall: function(object, event, args, options) {
    var result = object;
    options = _.defaults({}, options || {}, { prepare: true, call: true });
    if (options.prepare) args = $fn.prepareFireCallArgs(args, { fire: [], call: [] });
    if (options.callEventMethod) result = $fn.apply(object, _.camelCase(event.split(':').join(' ')), args.call);
    $fn.apply(object, 'fire', [event].concat(args.fire));
    return result;
  },

  /**
   * Fires lifecycle events, invokes callback and if event method (camel case transformed event) exists will invoke it.
   * @param {function(...)|Object} object - object to call
   * @param {string} event - event to fire and transform to callback name
   * @param {function(...)} callback
   * @param {Object} [args]
   * @param {Array} [lifeCycle]
   * @return {*}
   */
  fireCallCyclic: function(object, event, callback, args, lifeCycle) {
    args = $fn.prepareFireCallArgs(args, { fire: [], call: [], callback: [], callEventMethod: true });
    lifeCycle = $val(lifeCycle, ['before', '@callback', 'after'], _.isArray);
    for (var i = 0; i < lifeCycle.length; i ++) {
      var now = lifeCycle[i], nowEvent = Fiber.Events.joinEventName([now, event]), result;
      if (now === '@callback') {
        if (_.isFunction(callback)) result = callback.apply(object, args.callback);
        nowEvent = event;
      }
      $fn.fireCall(object, nowEvent, args, { prepare: false, callEventMethod: args.callEventMethod });
    }
    return result;
  },

  /**
   * Returns wrapped `fireCallCyclic` method
   * @param {function(...)} fn
   * @param {string} event
   * @param {Object} [args]
   * @param {Array} [lifeCycle]
   * @returns {function(...)}
   */
  wrapFireCallCyclic: function(fn, event, args, lifeCycle) {
    return _.wrap(fn, _.bind(function(execFn) {
      return $fn.fireCallCyclic(this, event, execFn, args, lifeCycle);
    }, this));
  },

  /**
   * Prepares arguments for fire call methods
   * @param {Object} args
   * @param {Object} [defaults={}]
   * @returns {Object}
   */
  prepareFireCallArgs: function(args, defaults) {
    var prepared = $valMerge(args, defaults, 'defaults');
    for (var key in prepared) {
      var value = prepared[key];
      if (_.isArguments(value)) prepared[key] = value;
      else prepared[key] = $castArr(value);
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
   * Logs object to the console or if `log` is `false` returns object serialized to string.
   * @param {object} object
   * @param {boolean} [log=true]
   * @returns {string}
   */
  debug: function(object, log) {
    var msg = "[Fiber.Debug] >> `" + $fn.types.what(object).getType() + "`:\n" + $fn.serialize.stringify(object, true);
    return $val(log, true, _.isBoolean) ? $log.debug(msg) && void 0 : msg;
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
   * Returns browser map with current user agent marked as `true`
   * @returns {Object}
   */
  detectBrowser: function() {
    var isOpera = $fn.types.parseSignature(root.opera) == '[object Opera]'
      , agent = navigator.userAgent;
    return {
      isIE: $fn.cast.toBoolean(window.attachEvent && ! isOpera),
      isOpera: isOpera,
      isWebKit: $fn.cast.toBoolean(~ agent.indexOf('AppleWebKit/')),
      isGecko: ~ agent.indexOf('Gecko') && ! (~ agent.indexOf('KHTML')),
      isMobileSafari: /Apple.*Mobile/.test(agent)
    }
  },

  /**
   * Returns what user agent is currently detected
   * @returns {string|null}
   */
  whatBrowser: function() {
    var map = $fn.detectBrowser();
    var pairs = _.toPairs(map);
    for (var i = 0; i < pairs.length; i ++) if (pairs[i][1]) return pairs[i][0].replace('is', '');
    return null;
  }
};
