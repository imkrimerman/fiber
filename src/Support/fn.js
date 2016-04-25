/**
 * Fiber support function
 * @type {Object}
 */
var fn = Fiber.fn = {

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
   * Returns support functions module
   * @param {string} alias
   * @returns {Object|null}
   */
  module: function(alias) {
    if (! alias || ! fn.hasOwnProperty(alias)) return null;
    return fn[alias];
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
    defaults = arguments.length > 1 ? defaults : fn.notDefined;
    // if we don't have any `value` then return `defaults`
    if (! arguments.length) return defaults;
    // if value check was made and it's not valid then return `defaults`
    if (! fn.valCheck(value, checker, match)) return defaults;
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
    return _[match](_.castArray(checkers), function(check) {
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
    return val(cb, _.noop, _.isFunction)(val(value, defaults, checker, match));
  },

  /**
   * Applies `val` checker function and extends checked value with `extender` if allowed.
   * @param {*} value - value to check
   * @param {Object} extender - object to extend with
   * @param {?Function|string} [fn=_.extend] - function to use to merge the objects (can be lodash method name or
   * function)
   * @param {?Function} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'some')
   * @param {?boolean} [toOwn=false] - if true then sets extender directly to checked value,
   * otherwise creates new object and merges checked value with extender
   * @returns {Object|Function}
   */
  valMerge: function(value, extender, fn, checker, match, toOwn) {
    fn = val(fn, _.extend, [_.isFunction, _.isString], 'some');
    if (_.isString(fn) && _.has(_, fn)) fn = _[fn];
    if (! val.isDef(checker)) checker = _.isPlainObject;
    toOwn = val(toOwn, false, _.isBoolean);
    return fn.valCb(value, {}, function(checked) {
      var args = toOwn ? [checked, extender] : [{}, checked, extender];
      if (! fn.isExtendable(args)) return checked;
      return fn.apply(_, args);
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
    if (fn.isArrayOf(array, 'array'))
      return _.flattenDeep(array);
    else if (fn.isArrayOf(array, 'object'))
      return _.extend.apply(_, [{}].concat(array));
    return array;
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
    scope = val(scope, Class, _.isObject);
    var method = fn.class.getMethod(Class, method);
    if (val(args) === val.notDefined) args = [];
    else args = ! _.isArguments(args) ? _.castArray(args) : args;
    if (_.isFunction(method)) return method.apply(scope, args);
  },

  /**
   * Applies function with the given arguments and scope
   * @param {Function} fn - function to apply
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [scope] - scope to bind to function
   * @returns {*}
   */
  applyFn: function(fn, args, scope) {
    return fn.apply({fn: fn}, 'fn', args, scope);
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires event
   * @param {Function|Object} Class - Class to call
   * @param {string} event - event to fire and transform to callback name
   * @param {?Object} [args]
   * @param {?boolean} [prepare=true]
   * @return {*}
   */
  fireCall: function(Class, event, args, prepare) {
    if (val(prepare, true)) args = fn.prepareCallArgs(args, {fire: [], call: []});
    var result = fn.apply(Class, _.camelCase(event.split(':').join(' ')), args.call);
    fn.apply(Class, 'fire', [event].concat(args.fire));
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
    args = fn.prepareCallArgs(args, {fire: [], call: [], callback: []})
    lifeCycle = val(lifeCycle, ['before', '@callback', 'after'], [_.isArray, _.negate(_.isEmpty)]);

    var result;

    for (var i = 0; i < lifeCycle.length; i ++) {
      var now = lifeCycle[i]
        , nowEvent = now[now.length - 1] === ':' ? now + event : now + ':' + event;

      if (now === '@callback' && _.isFunction(callback)) result = callback.apply(Class, args.callback);
      else fn.fireCall(Class, nowEvent, args, false);
    }

    return result;
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
      return fn.fireCallCyclic(this, event, execFn, args, lifeCycle);
    }, this));
  },

  /**
   * Prepares arguments for fire call methods
   * @param {Object} args
   * @param {?Object} [defaults={}]
   * @returns {*|Object|stream}
   */
  prepareCallArgs: function(args, defaults) {
    var prepared = _.extend({}, defaults || {}, val(args, {}, _.isPlainObject));
    return fn.transform(prepared, function(val) {
      if (_.isArguments(val)) return val;
      return _.castArray(val);
    });
  },

  /**
   * Binds array of `mixins` or mixin to the given object `scope`, also you can bind
   * each method of object mixin to scope by providing the `innerApply` with true
   * @param {Array|Object|Function} mixins
   * @param {Object} thisArg
   * @param {?Array} [partials=[]]
   * @returns {Array|Object|Function}
   */
  bind: function(mixins, thisArg, partials) {
    var wasArray = _.isArray(mixins);

    function bindFn(mixin) {
      if (! _.isFunction(mixin)) return mixin;
      return _.bind.apply(_, [mixin, thisArg].concat(val(partials, [])));
    };

    mixins = _.castArray(mixins);

    for (var i = 0; i < mixins.length; i ++) {
      if (_.isPlainObject(mixins[i]) || _.isArray(mixins[i]))
        mixins[i] = fn.transform(_.clone(mixins[i]), bindFn);
      else mixins[i] = bindFn(mixins[i]);
    }

    return wasArray ? mixins : _.first(mixins);
  },

  /**
   * Transforms object
   * @param {Object} object
   * @param {Function} iteratee
   * @returns {Object}
   */
  transform: function(object, iteratee, thisArg) {
    thisArg = val(thisArg, object);
    for (var key in object)
      object[key] = iteratee.call(thisArg, object[key], key, object);
    return object;
  },

  /**
   * Sets `value` as global variable by the given `key` to the root
   * @param {string} key
   * @param {*} value
   * @param {?boolean} [force=false]
   * @returns {boolean}
   */
  globalize: function(key, value, force) {
    if (! Const.allowGlobals) {
      Fiber.internal.log.info(key + ' will not be globalized. Global variables are not allowed.')
      return false;
    }

    var hasKey = root && _.has(root, key) || false;

    if ((hasKey && val(force, false, _.isBoolean)) || ! hasKey) {
      root[key] = value;
      return true;
    }

    return false;
  },

  /**
   * Checks if given array is array with objects
   * @param {Array} array - Array to check
   * @param {string} of - String of type (object, string, array ...etc)
   * @param {?string} [method=every] Method to use to check if `every`, `any` or `some` conditions worked
   * @returns {*|boolean}
   */
  isArrayOf: function(array, of, method) {
    method = val(method, 'every', _.isString);
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
    return js.arr.concat.apply([], args);
  },

  /**
   * Concatenates arguments into one array,
   * if item is arguments it will be converted to array
   * @param {number} level
   * @param {...args}
   * @returns {Array}
   */
  argsConcatFlat: function(level) {
    var concatenated = fn.argsConcat.apply(fn, _.drop(arguments));
    return _.flattenDepth(concatenated, val(level, 1, _.isNumber));
  },

  /**
   * Concatenates arrays into one.
   * If last argument is boolean then it will be used to determine,
   * if we need to make unique array.
   * @param {...args}
   * @returns {Array}
   */
  concat: function() {
    var makeUnique = val(_.last(arguments), true, _.isBoolean);
    var args = js.arr.concat.apply([], _.toArray(arguments).map(_.castArray));
    return makeUnique ? _.uniq(args) : args;
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  proto: function(exclude) {
    return _.omit(fn, fn.protoExclude.concat(val(exclude, [], _.isArray)));
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
   * Gets value by the given `fn` key.
   * If `scope` is provided, then value will be retrieved from `scope` by `fn` property and reset to `fn`
   * If `fn` value is function then it will be called with `args`.
   * @param {string|Function|*} fn
   * @param {?Object} [scope]
   * @param {?boolean} [own=false]
   * @param {?Array} [args=[]]
   * @returns {*}
   */
  result: function(fn, scope, own, defaults) {
    var inScope = val(scope, false, _.isObject);
    own = val(own, false, _.isBoolean);
    if (inScope) fn = own ? _.get(scope, fn, null) : scope[fn];
    if (_.isFunction(fn)) fn = inScope && fn.apply(scope) || (fn.apply(fn));
    return val(fn, defaults, _.negate(_.isUndefined));
  },

  /**
   * Determines if object can be extended.
   * Check for `extend` function or if it's plain object
   * @param {*} object
   * @returns {boolean}
   */
  isExtendable: function(object) {
    if (arguments.length > 1) object = _.toArray(arguments);
    return _.every(_.castArray(object), function(one) {
      return _.isObject(one) && (_.isFunction(one.extend) || _.isPlainObject(one));
    });
  },

  /**
   * Expect that object has all given properties
   * @param {Object} obj
   * @param {Array|Object} props
   * @param [{boolean}] isObject - default to `true`
   */
  expectHasAllProps: function(obj, props) {
    var isObject = _.isArray(props) ? false : true;
    return _.every(props, function(prop, key) {
      var prop = isObject ? key : props[key];
      return isObject ? _.has(obj, prop) : _.includes(obj, prop);
    });
  },

  /**
   * Hoists given props to object direct scope (this)
   * @param {Object} object
   * @param {?Array} [props]
   * @returns {Object}
   */
  applyOwn: function(object, props) {
    return $OwnProps.applyMethod($OwnProps.getInitMethod(), [props], object);
  },

  /**
   * Extends object with given options object
   * @param {Object} object
   * @param {Object} options
   * @returns {Object}
   */
  applyExtend: function(object, options) {
    return $Extend.applyMethod($Extend.getInitMethod(), [options], object);
  },

  /**
   * Creates plain object with the given key and value
   * @param {string} key
   * @param {*} value
   * @returns {Object}
   */
  createObj: function(key, value) {
    var obj = {};
    obj[key] = value;
    return obj;
  },

  /**
   * Copies properties from source object to destination object
   * @param {Object} destination
   * @param {Object} source
   * @param {Array} props
   * @param {?boolean} [deep=false]
   * @returns {*|Object}
   */
  copyProps: function(destination, source, props, deep) {
    var fn = val(deep, false, _.isBoolean) ? 'cloneDeep' : 'clone';
    for (var i = 0; i < props.length; i ++) if (_.has(source, props[i]))
      destination[props[i]] = _[fn](source[props[i]]);
    return destination;
  },

  /**
   * Force object cast to array
   * @param {Object} object
   * @returns {Array}
   */
  castArr: function(object) {
    return _.castArray(object);
  },

  /**
   * Returns function name
   * @param {Function} fn
   * @returns {string}
   */
  getFunctionName: function(fn) {
    var strFn = fn.toString();
    ///^function\s+([\w\$]+)\s*\(/.exec( myFunction.toString() )[ 1 ]
    return strFn.substr('function '.length).substr(0, strFn.indexOf('('));
  },

  /**
   * Returns file name of current executed file
   * @returns {string}
   */
  getFileName: function() {
    return location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
  },
};

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
fn.val.notDefined = fn.notDefined;

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 * @static
 */
fn.val.isDef = function(value) {
  if (! arguments.length) return false;
  return fn.val(value) !== fn.notDefined;
};

/**
 * @inheritDoc
 * @type {Fiber.fn.val}
 */
var val = fn.val

/**
 * @inheritDoc
 * @type {Fiber.fn.valMerge}
 */
, valMerge = fn.valMerge

/**
 * Cache lodash `each` method to use in backward compatibility mode for the previous lodash versions
 * @type {_.each|*|(function((Array|Object), Function=): (Array|Object))}
 */
, each = _.each

/**
 * Caches Backbone trigger method
 * @type {Function}
 */
, trigger = Backbone.trigger;

/**
 * Add alias for `some` function
 */
_.mixin({any: _.some});

/**
 * Adds backward compatibility for lodash `each` method
 * @param {Array|Object} collection
 * @param {Function} iteratee
 * @param {?Object} [scope]
 * @returns {*}
 */
_.each = _.forEach = function(collection, iteratee, scope) {
  if (scope) iteratee = _.bind(iteratee, scope);
  return each(collection, iteratee);
};

/**
 * Replaces Backbone trigger method to give ability to listen to event without actual object to listen on
 * @param {string} name
 * @param {...args}
 * @returns {Backbone}
 */
Backbone.trigger = function(name) {
  var args = _.toArray(arguments);
  if (arguments[1] !== this) args.splice(1, 0, this);
  trigger.apply(Const.events.system, args);
  trigger.apply(this, arguments);
  return this;
};
