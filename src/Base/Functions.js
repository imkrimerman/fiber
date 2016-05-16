/**
 * Value that represents `not defined` state
 * @type {string}
 */
var $notDefined = '$_NOT_DEFINED_$';

/**
 * Function to transform type before check.
 * @type {Function}
 */
var $typeTransformer = String.prototype.toLowerCase.call;

/**
 * Returns string representation of object.
 * @param {Object} object
 * @returns {string}
 */
var $objToString = function(object) {
  return Object.prototype.toString.call(object);
};

/**
 * Returns string representation of function.
 * @param {Object} object
 * @returns {string}
 */
var $funcToString = function(object) {
  return Function.prototype.toString.call(object);
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
  if (! arguments.length) return defaults;
  // if value check was made and it's not valid then return `defaults`
  if (! $valCheck(value, checker, match)) return defaults;
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
  if (! _.isArray(checkers) && ! _.isFunction(checkers)) return true;
  return _[match || 'some']($castArr(checkers), function(check) {
    if (_.isFunction(check)) return check(value);
  });
};

/**
 * Returns `value` if `includes` array contains `value` or returns defaults otherwise.
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {Array|Object} [includes] - array of values to check if the value is contained there
 * @param {?string} [match='some'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {boolean}
 */
var $valIncludes = function(value, defaults, includes, match) {
  if (includes == null) includes = ['every', 'some', 'any'];
  if (_.isPlainObject(includes)) includes = _.keys(includes);
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
  if (! _.isFunction(cb)) return val;
  return cb(val);
};

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
var $valMerge = function(value, extender, method, checker, match, toOwn) {
  method = $val(method, _.extend, [_.isFunction, _.isString]);
  if (_.isString(method) && $has(_, method)) method = _[method];
  if (! $isDef(checker)) checker = _.isPlainObject;
  toOwn = $val(toOwn, false, _.isBoolean);
  return $valCb(value, {}, function(checked) {
    var args = toOwn ? [checked, extender] : [{}, checked, extender];
    if (! $isExtendable(args)) return checked;
    return method.apply(_, args);
  }, checker, match);
};

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 */
var $isDef = function(value) {
  if (! arguments.length) return false;
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
  if (arguments.length > 1) object = _.toArray(arguments);
  return _.every($castArr(object), function(one) {
    return _.isObject(one) && ($isClass(object) || _.isFunction(one.extend) || _.isPlainObject(one));
  });
};

/**
 * Determines if given object is Class
 * @type {Object}
 */
var $isClass = function(object) {
  if (_.isPlainObject(object) || _.isArray(object)) return false;
  var proto = Object.getPrototypeOf(object);
  if (proto === null) return false;
  return (typeof proto.constructor == 'function');
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
  if (! _.isArray(path)) return _.get(object, path, defaults);
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
  var isArr = _.isArray(object);
  if (_.isPlainObject(path)) {
    if (! isArr) _.extend(object, path);
    else object.push.apply(object, _.values(path));
  }
  if (! _.isArray(path)) _.set(object, path, value);
  else {
    var isValueArray = _.isArray(value);
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
  if (! _.isArray(path)) return _.has(object, path);
  var fn = _.isString(match) ? match : 'every';
  return _[fn](path, function(prop) {
    return $has(object, prop);
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
  if (! _.isObject(object)) return object;
  if (_.isFunction(object)) return object(path, defaults, object);
  return _.map($castArr(path), function(prop) {
    return _.result(object, prop, defaults);
  });
};

/**
 * Removes `value` by the given `path` key.
 * @param {Object} object
 * @param {string} path
 * @returns {Object}
 */
var $forget = function(object, path) {
  if (! _.isArray(path)) _.unset(object, path);
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
  if (_.isString(keys) && arguments.length === 3) {
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
  if (_.isString(keys) && arguments.length === 3) {
    object = $get(object, keys);
    keys = arguments[2];
  }
  return _.omit(object, keys);
};

/**
 * A no-operation function that returns undefined regardless of the arguments it receives.
 * @returns {void}
 */
var $noop = function() {};

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
 * @param {Object} scope
 * @param {...args}
 * @returns {function(...)}
 */
var $bind = function(scope) {
  if (typeof this !== 'function') throw new TypeError('`Function.bind` >> Caller is not callable.');
  var slice = Array.prototype.slice
    , partials = slice.call(arguments, 1)
    , args = partials.concat(slice.call(arguments))
    , fnToBind = this
    , bound = function() {
    return fnToBind.apply(this instanceof $noop && scope ? this : scope, args);
  };

  $noop.prototype = this.prototype;
  bound.prototype = new $noop();
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
    if (_.isFunction(value)) return value;
    if (_.isArray(value)) return value.slice();
    return _.clone(value);
  }, _.isFunction));
};

/**
 * Clones `object` deep using `customizer`
 * @param {Object} object
 * @param {function(...)} customizer
 * @param {?Object} [scope]
 * @returns {Object}
 */
var $cloneDeepWith = function(object, customizer, scope) {
  if (_.isObject(scope)) customizer = _.bind(customizer, scope);
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
 * @returns {Array}
 */
var $castArr = function(object) {
  if (_.isArray(object)) return object;
  if (_.isArguments(object)) return Array.prototype.slice.call(object);
  return [object];
}

/**
 * Returns result of `typeof` call on `arg`
 * @param {*} arg
 * @param {boolean} [transform=false]
 * @returns {string}
 */
var $parseType = function(arg, transform) {
  var result = typeof arg;
  return transform ? $typeTransformer(result) : result;
};

/**
 * Returns result of `toString` call on `arg`
 * @param {*} arg
 * @param {boolean} [transform=false]
 * @returns {string}
 */
var $parseSignature = function(arg, transform) {
  var result = $objToString(arg);
  return transform ? $typeTransformer(result) : result;
};

/**
 * Returns Type hash for the given `arg` or undefined if not matched any of known types.
 * @param {*} arg
 * @returns {Object|void}
 */
var $whatType = function(arg) {
  var argType = $parseType(arg, true), argSignature = $parseSignature(arg, true), $tr = $typeTransformer;
  for (var i = 0; i < $BaseTypes.length; i ++) {
    if (argType !== $tr($BaseTypes[i].type) || argSignature !== $tr($BaseTypes[i].signature)) continue;
    return $BaseTypes[i];
  }
};

/**
 * Determines if `arg` is of `type`
 * @param {*} arg
 * @param {*} type
 * @returns {boolean}
 */
var $ofType = function(arg, type) {
  var detected = $whatType(arg);
  if (! detected) return $parseSignature(arg, true) === $parseSignature(type, true);
  if (! _.isPlainObject(type) || ! type.type && ! type.signature) type = $whatType(type);
  return detected.type === type.type && detected.signature === type.signature;
};

/**
 * Superagent request.
 * @type {Function}
 */
var $request = superagent;
