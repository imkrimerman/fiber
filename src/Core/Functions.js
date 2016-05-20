/**
 * Value that represents `not defined` state
 * @type {string}
 */
var $notDefined = '$_NOT_DEFINED_$';

/**
 * Used to generate unique IDs
 * @type {Object}
 */
var idCounters = {};

/**
 * Function to transform type before check.
 * @type {Function}
 */
var $typeTransformer = String.prototype.toLowerCase;

/**
 * Cached `Object.prototype.toString` caller.
 * @type {Function}
 */
var objectToStringCaller = Object.prototype.toString;

/**
 * Cached `Array.slice` function.
 * @type {Function}
 */
var sliceCaller = Array.prototype.slice;

/**
 * Cached `Function.prototype.toString` caller.
 * @type {Function}
 */
var funcToStringCaller = Function.prototype.toString;

/**
 * Cached stringified Object constructor
 * @type {string}
 */
var objectCtorString = funcToStringCaller.call(Object);

/**
 * Returns string representation of object.
 * @param {Object} object
 * @returns {string}
 */
var $objToString = function(object) {
  return objectToStringCaller.call(object);
};

/**
 * Returns string representation of function.
 * @param {Object} object
 * @returns {string}
 */
var $funcToString = function(object) {
  return funcToStringCaller.call(object);
};

/**
 * Slices Array.
 * @param {Array|Arguments} object
 * @returns {Array}
 */
var $slice = function(object) {
  return sliceCaller.apply(object, _.drop(arguments));
};

/**
 * Returns value if not undefined or null, otherwise returns defaults or $__NULL__$ value.
 * @see https://github.com/imkrimerman/im.val (npm version without current enhancements)
 * @param {*} value - value to check
 * @param {*} [defaults] - default value to use
 * @param {?function(...)|function(...)[]} [checker] - function to call to check validity
 * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {*}
 */
var $val = function(value, defaults, checker, match) {
  // if defaults not specified then assign notDefined `$__NULL__$` value
  defaults = arguments.length > 1 ? defaults : $notDefined;
  // if we don't have any `value` then return `defaults`
  if(! arguments.length) return defaults;
  // if value check was made and it's not valid then return `defaults`
  if(! $valCheck(value, checker, match)) return defaults;
  // if value not specified return defaults, otherwise return value;
  return value != null ? value : defaults;
};

/**
 * Validates value with the given checkers
 * @param {*} value - value to check
 * @param {Array|function(...)} checkers - function to call to check validity
 * @param {?string} [match='some'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {boolean}
 */
var $valCheck = function(value, checkers, match) {
  // if value and checker is specified then use it to additionally check value
  if(! $isArr(checkers) && ! $isFn(checkers)) return true;
  return _[match || 'some']($castArr(checkers), function(check) {
    if($isFn(check)) return check(value);
  });
};

/**
 * Returns `value` if `includes` array contains `value` or returns defaults otherwise.
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {Array|Object} [includes] - array of values to check if the value is contained there
 * @param {?string} [match='some'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {*}
 */
var $valIncludes = function(value, defaults, includes, match) {
  if(includes == null) includes = ['every', 'some', 'any'];
  if($isPlain(includes)) includes = _.keys(includes);
  return $val(value, defaults, function(val) {
    return _.includes(includes, val);
  }, match || 'some');
};

/**
 * Applies `val` function and calls callback with result as first argument
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {function(...)} cb - callback to call after check
 * @param {?function(...)} [checker] - function to call to check validity
 * @param {?string} [match='every'] - function to use ('every', 'some')
 * @returns {*}
 */
var $valCb = function(value, defaults, cb, checker, match) {
  var val = $val(value, defaults, checker, match);
  if(! $isFn(cb)) return val;
  return cb(val);
};

/**
 * Applies `val` checker function and extends checked value with `extender` if allowed.
 * @param {*} value - value to check
 * @param {Object} extender - object to extend with
 * @param {function(...)|string} [method=_.defaults] - function to use to merge the objects (can be
 * lodash method name or function)
 * @param {Array} [defaultsAndChecker] - array with defaults value first and function to call to check validity
 * @param {boolean} [toOwn=false] - if true then sets extender directly to checked value,
 * otherwise creates new object and merges checked value with extender
 * @param {string} [match='every'] - function to use ('every', 'some')
 * @returns {Object|function(...)}
 */
var $valMerge = function(value, extender, method, defaultsAndChecker, toOwn, match) {
  method = $val(method, _.defaults, [$isFn, $isStr]);
  if($isStr(method) && $has(_, method)) method = _[method];
  if(! $isDef(defaultsAndChecker)) defaultsAndChecker = [{}, $isPlain];
  toOwn = $val(toOwn, false, _.isBoolean);
  return $valCb(value, defaultsAndChecker[0], function(checked) {
    var args = toOwn ? [checked, extender] : [defaultsAndChecker[0], checked, extender];
    if(! $isExtendable(args)) return checked;
    return method.apply(_, args);
  }, defaultsAndChecker[1], match);
};

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 */
var $isDef = function(value) {
  if(! arguments.length) return false;
  return $val(value) !== $notDefined;
};

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
$val.notDefined = $notDefined;

/**
 * Determines if object can be extended.
 * Check for `extend` function or if it's plain object
 * @param {*} object
 * @returns {boolean}
 */
var $isExtendable = function(object) {
  if(arguments.length > 1) object = _.toArray(arguments);
  return _.every($castArr(object), function(one) {
    return $isObj(one) && ($isClass(object) || $isFn(one.extend) || $isPlain(one));
  });
};

/**
 * Determines if given `object` has `Backbone.Events`.
 * @param {Object} object
 * @returns {boolean}
 */
var $isBackboneEventable = function(object) {
  var checkMethods = ['trigger', 'listenTo', 'stopListening', 'on', 'off'];
  if(arguments.length > 1) object = _.toArray(arguments);
  return _.every($castArr(object), function(one) {
    return $hasGiven(one, checkMethods, $isFn);
  });
};

/**
 * Determines if given `object` has `Fiber.Events`.
 * @param {Object} object
 * @returns {boolean}
 */
var $isEventable = function(object) {
  var checkMethods = ['fire', 'when', 'after', 'whenGlobal', 'afterGlobal'];
  if(arguments.length > 1) object = _.toArray(arguments);
  return _.every($castArr(object), function(one) {
    return one.eventsConfig && $hasGiven(one, checkMethods, $isFn);
  });
};

/**
 * Determines if `object` has all given props.
 * @param {Object} object
 * @param {string|Array} props
 * @param {function(arg): boolean} [checkFn]
 * @returns {boolean}
 */
var $hasGiven = function(object, props, checkFn) {
  var isFunc = $isFn(checkFn);
  return _.every($castArr(props), function(name) {
    return isFunc ? checkFn(object[name]) : $has(object, name);
  });
};

/**
 * Determines if given object is Class
 * @type {Object}
 */
var $isClass = function(object) {
  if($isPlain(object) || $isArr(object)) return false;
  var proto = Object.getPrototypeOf(object);
  if(proto === null) return false;
  return typeof proto.constructor == 'function' && $funcToString(object) != objectCtorString;
};

/**
 * Gets value by given `path` key. You can provide `defaults` value that
 * will be returned if value is not found by the given key. If `defaults` is
 * not provided then `null` will be returned.
 * @param {Object} object
 * @param {string} path
 * @param {*} [defaults]
 * @returns {*}
 */
var $get = function(object, path, defaults) {
  if(! $isArr(path)) return _.get(object, path, defaults);
  return _.map(path, function(prop) {
    return $get(object, prop);
  });
};

/**
 * Sets `value` by given `path` key.
 * @param {Object} object
 * @param {string} path
 * @param {*} value
 * @returns {Object}
 */
var $set = function(object, path, value) {
  var isArr = $isArr(object);
  if($isPlain(path)) {
    if(! isArr) _.merge(object, path);
    else object.push.apply(object, _.values(path));
  }
  if(! $isArr(path)) _.set(object, path, value);
  else {
    var isValueArray = $isArr(value);
    $each(path, function(prop, index) {
      $set(object, prop, isValueArray ? value[index] : value);
    });
  }
  return object;
};

/**
 * Determine if `object` has given `path`.
 * @param {Object} object
 * @param {string} path
 * @param {string} [match]
 * @returns {boolean}
 */
var $has = function(object, path, match) {
  match = $isStr(match) ? match : 'every';
  if($isArr(object)) return _[match]($castArr(path), function(part) {
    return _.includes(object, part);
  });

  if(! $isArr(path)) return _.has(object, path);
  return _[match](path, function(prop) {
    return _.has(object, prop);
  });
};

/**
 * Gets value by the given `path` key, if `path` value is function then it will be called.
 * You can provide `defaults` value that will be returned if value is not found
 * by the given key. If `defaults` is not provided that defaults will be set to `null`.
 * @param {Object|function(...args)} object
 * @param {string} [path]
 * @param {*} [defaults]
 * @returns {*}
 */
var $result = function(object, path, defaults) {
  if(! $isObj(object)) return object;
  if($isFn(object)) return object(path, defaults, object);
  if(arguments.length === 1) return object;
  var mapped = _.map($castArr(path), function(prop) {
    return _.result(object, prop, defaults);
  });
  return $isArr(path) ? mapped : mapped[0];
};

/**
 * Removes `value` by the given `path` key.
 * @param {Object} object
 * @param {string} path
 * @returns {Object}
 */
var $forget = function(object, path) {
  if(! $isArr(path)) _.unset(object, path);
  else $each(path, function(prop) {
    $forget(object, prop);
  });
  return object;
};

/**
 * Picks values from `object` by provided `keys`.
 * @param {Object} object
 * @param {Array} keys
 * @returns {Object}
 */
var $pick = function(object, keys) {
  if($isStr(keys) && arguments.length === 3) {
    object = $get(object, keys);
    keys = arguments[2];
  }
  return _.pick(object, keys);
};

/**
 * Omits values from `object` by provided `keys`.
 * @param {Object} object
 * @param {Array} keys
 * @returns {Object}
 */
var $omit = function(object, keys) {
  if($isStr(keys) && arguments.length === 3) {
    object = $get(object, keys);
    keys = arguments[2];
  }
  return _.omit(object, keys);
};

/**
 * Creates a slice of `array` with `n` elements dropped from the beginning.
 * @param {Array|Arguments} array
 * @param {number} [n=1]
 * @returns {Array}
 */
var $drop = function(array, n) {
  if($isArgs(array)) array = $slice(array);
  return _.drop(array, n);
};

/**
 * Merges multiple objects or arrays into one.
 * @param {string} fn
 * @param {Array|Arguments} mergable - Array of objects/arrays to merge
 * @param {...args}
 * @returns {Array|Object}
 */
var $squash = function(fn, mergable) {
  mergable = $fn.compact($slice($castArr(mergable)));
  if($isArrayOf('array', mergable)) return _.flattenDeep(mergable);
  if($isArrayOf('object', mergable)) return _[fn].apply(_, [{}].concat(mergable));
  return [];
};

/**
 * Checks if given array is array with objects
 * @param {string} type - type (object, string, array ...etc)
 * @param {Array} array - Array to check
 * @param {?string} [method=every] Method to use to check if `every`, `any` or `some` conditions
 *   worked
 * @returns {*|boolean}
 */
var $isArrayOf = function(type, array, method) {
  method = $val(method, 'every', $isStr);
  return $isArr(array) && _[method](array, _['is' + _.capitalize(type)]);
};

/**
 * A no-operation function that returns undefined regardless of the arguments it receives.
 * @returns {void}
 */
var $noop = function() {
};

/**
 * Starts timer to detect function execution speed.
 * Passes `done` callback as the last argument to mark execution state as `finished`.
 * @param {Function} fn
 * @param {Array|Arguments} [args]
 * @param {Object} [scope]
 */
var $timer = function(fn, args, scope) {
  var stringFn = fn;
  console.time("[Fiber.$timer] >>\n" + stringFn);
  fn.apply(scope || fn, $castArr(args).concat(function() {
    console.timeEnd("[Fiber.$timer] >>\n" + stringFn);
    arguments.length && console.log(arguments);
  }));
};

/**
 * The bind function is an addition to ECMA-262, 5th edition; as such it may not be present in all browsers.
 * You can partially work around this by inserting the following code at the beginning of your scripts,
 * allowing use of much of the functionality of bind() in implementations that do not natively support it.
 * @param {Function} fn
 * @param {Object} scope
 * @param {...args}
 * @returns {function(...)}
 */
var $bind = function(fn, scope) {
  if($parseType(
      fn) !== 'function') throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  var partials = $slice(arguments, 2)
    , fnToBind = fn
    , noop = function() {
  }
    , bound = function() {
    scope = fn.prototype && fn instanceof noop && scope ? fn : (scope || {});
    return fnToBind.apply(scope, partials.concat($slice(arguments)));
  };

  bound.prototype = fn.prototype;
//   bound.prototype = new noop();
  return bound;
};

/**
 * Clones object
 * @param {Object} object
 * @param {?boolean} [deep=false]
 * @param {function(...)} [cloneIterator]
 */
var $clone = function(object, deep, cloneIterator) {
  return (deep ? $cloneDeepWith : $cloneWith)(object, $val(cloneIterator, function(value) {
    if($isFn(value)) return value;
    if($isArr(value)) return value.slice();
    return _.clone(value);
  }, $isFn));
};

/**
 * Clones `object` deep using `customizer`
 * @param {Object} object
 * @param {function(...)} customizer
 * @param {?Object} [scope]
 * @returns {Object}
 */
var $cloneDeepWith = function(object, customizer, scope) {
  if($isObj(scope)) customizer = $bind(customizer, scope);
  return _.cloneDeepWith(object, customizer);
};

/**
 * Clones `object` using `customizer`
 * @param {Object} object
 * @param {function(...)} customizer
 * @param {?Object} [scope]
 * @returns {Object}
 */
var $cloneWith = function(object, customizer, scope) {
  var clone = {};
  $each(object, function(val, prop) {
    clone[prop] = customizer.call(scope, val, prop);
  });
  return clone;
};

/**
 * Casts given object to Array
 * @param {*} object
 * @param {boolean} [compact=false]
 * @returns {Array}
 */
var $castArr = function(object, compact) {
  if($isArr(object)) return object;
  if($isArgs(object)) return $slice(object);
  return compact ? $compact([object]) : [object];
};

/**
 * Removes all falsey values from array.
 * Falsey values `false`, `null`, `0`, `""`, `undefined`, and `NaN`.
 * @param {Array} array
 * @returns {Array}
 */
var $compact = function(array) {
  var i = - 1, index = 0, result = []
    , length = (array = $castArr(array)) ? array.length : 0;
  while(++ i < length) if(array[i]) result[index ++] = array[i];
  return result;
};

/**
 * Creates function that returns `value`.
 * @param {*} value
 * @returns {function(...)}
 */
var $constant = function(value) {
  return function() {
    return value;
  };
};

/**
 * Passes `value` through.
 * @param {*} value
 * @returns {*}
 */
var $through = function(value) {
  return value;
};

/**
 * Assertion helper
 * @param {boolean} statement
 * @param {string} errorMsg
 * @throws Will throw `Error` if statement is not true
 */
var $expect = function(statement, errorMsg) {
  if(! statement) throw new Error(errorMsg || 'Expected `statement` to be true');
};

/**
 * Returns result of `typeof` call on `arg`
 * @param {*} arg
 * @param {boolean} [transform=false]
 * @returns {string}
 */
var $parseType = function(arg, transform) {
  var result = typeof arg;
  return transform ? $typeTransformer.call(result) : result;
};

/**
 * Returns result of `toString` call on `arg`
 * @param {*} arg
 * @param {boolean} [transform=false]
 * @returns {string}
 */
var $parseSignature = function(arg, transform) {
  var result = $objToString(arg);
  return transform ? $typeTransformer.call(result) : result;
};

/**
 * Returns Type hash for the given `arg` or undefined if not matched any of known types.
 * @param {*} arg
 * @returns {Object|void}
 */
var $whatType = function(arg) {
  var argType = $parseType(arg, true), argSignature = $parseSignature(arg, true), $tr = $typeTransformer.call;
  for(var i = 0; i < $BaseTypes.length; i ++) {
    if(argType !== $tr($BaseTypes[i].type) || argSignature !== $tr($BaseTypes[i].signature)) continue;
    return $BaseTypes[i];
  }
  return {
    type: argType, signature: argSignature, example: function() {
      return arg
    }
  };
};

/**
 * Determines if `arg` is of `type`
 * @param {*} arg
 * @param {*} type
 * @returns {boolean}
 */
var $ofType = function(arg, type) {
  var detected = $whatType(arg);
  if(! $isPlain(type) || ! type.type && ! type.signature) type = $whatType(type);
  return detected.type === type.type && detected.signature === type.signature;
};

/**
 * Returns browser map with current user agent marked as `true`
 * @returns {Object}
 */
var $detectBrowser = function() {
  var isOpera = $parseSignature(root.opera) == '[object Opera]' && window.opera
    , agent = navigator.userAgent;
  return {
    isIE: ! ! window.attachEvent && ! isOpera,
    isOpera: isOpera,
    isWebKit: ! ! ~ agent.indexOf('AppleWebKit/'),
    isGecko: ~ agent.indexOf('Gecko') && ! (~ agent.indexOf('KHTML')),
    isMobileSafari: /Apple.*Mobile/.test(agent),
    isChrome: ! ! window.chrome && ! isOpera,
    isFirefox: typeof InstallTrigger !== 'undefined',
    isPhantom: ! ! window.callPhantom,
  }
};

/**
 * Returns what user agent is currently detected
 * @returns {string|null}
 */
var $whatBrowser = function() {
  var map = $detectBrowser(), pairs = _.toPairs(map);
  for(var i = 0; i < pairs.length; i ++) if(pairs[i][1]) return pairs[i][0].replace('is', '');
  return null;
};

/**
 * Returns function that will create unique IDs.
 * @param {string} [name]
 * @returns {Function}
 */
var $idGeneratorFor = function(name) {
  name = $isStr(name) ? name : '$_default_$';
  if(! $isNum(idCounters[name])) idCounters[name] = 0;
  return function(prefix) {
    prefix = $val(prefix, '', $isStr);
    return prefix + ++ idCounters[name];
  };
};

/**
 * Generates Globally Unique Identifier
 * @returns {string}
 */
var $guid = function guid() {

  /**
   * @return {string}
   */
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
};

/**
 * Cached lodash checkers for convenient internal use.
 */
var $isObj = _.isObject
  , $isFn = _.isFunction
  , $isPlain = _.isPlainObject
  , $isArr = _.isArray
  , $isArgs = _.isArguments
  , $isStr = _.isString
  , $isNum = _.isNumber;
