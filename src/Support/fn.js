/**
 * Fiber support function
 * @var {Object}
 */
Fiber.fn = {

  /**
   * List of properties to exclude when mixin functions to Class prototype
   * @type {Array}
   */
  protoExclude: ['proto'],

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
    if (! alias || ! Fiber.fn.hasOwnProperty(alias)) return null;
    return Fiber.fn[alias];
  },

  /**
   * Returns value if not undefined or null,
   * otherwise returns defaults or $__NULL__$ value
   * @see https://github.com/imkrimerman/im.val (npm version)
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {?Function} [checker] - function to call to check validity
   * @param {?string} [match='every'] - function to use ('every', 'any')
   * @returns {*}
   */
  val: function(value, defaults, checker, match) {
    // if defaults not specified then assign notDefined `$__NULL__$` value
    defaults = arguments.length > 1 ? defaults : Fiber.fn.notDefined;
    // if we don't have any `value` then return `defaults`
    if (! arguments.length) return defaults;
    // if value check was made and it's not valid then return `defaults`
    if (! Fiber.fn.valCheck(value, checker, match)) return defaults;
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
   * Merges multiple objects or arrays into one.
   * @param {Array} args - Array of objects/arrays to merge
   * @returns {Array|Object}
   */
  merge: function(array) {
    if (arguments.length > 1) array = _.toArray(arguments);
    if (! _.isArray(array)) return array;
    array = _.compact(array);
    if (Fiber.fn.isArrayOf(array, 'array'))
      return _.flattenDeep(array);
    else if (Fiber.fn.isArrayOf(array, 'object'))
      return _.extend.apply(_, [{}].concat(array));
    return array;
  },

  /**
   * Applies `method` on given `Class` with `context` and passing `args`
   * @param {Function|Object} Class - Class to call
   * @param {string} method - method to call
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [context] - context to apply to
   * @returns {*}
   */
  apply: function(Class, method, args, context) {
    context = val(context, Class);
    args = val(args, []);

    var proto = Class.prototype || Class
      , method = proto && proto[method];

    args = ! _.isArguments(args) ? _.castArray(args) : args;
    if (_.isFunction(method)) return method.apply(context, args);
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
    if (val(prepare, true)) args = Fiber.fn.prepareInvokeArgs(args, {fire: [], invoke: []});
    var result = Fiber.fn.apply(Class, _.camelCase(event.split(':').join(' ')), args.invoke);
    Fiber.fn.apply(Class, 'fire', [event].concat(args.fire));
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
  fireCallCycle: function(Class, event, callback, args, lifeCycle) {
    args = Fiber.fn.prepareInvokeArgs(args, {fire: [], invoke: [], callback: []})
    lifeCycle = val(lifeCycle, ['before', '@callback', 'after'], [_.isArray, _.negate(_.isEmpty)]);

    var result;
    for (var i = 0; i < lifeCycle.length; i ++) {
      var now = lifeCycle[i]
        , nowEvent = now[now.length - 1] === ':' ? now + event : now + ':' + event;
      if (now === '@callback' && _.isFunction(callback))
        result = callback.apply(Class, args.callback);
      else Fiber.fn.fireCall(Class, nowEvent, args, false);
    }

    return result;
  },

  /**
   * Prepares arguments for fire invoke methods
   * @param {Object} args
   * @param {?Object} [defaults={}]
   * @returns {*|Object|stream}
   */
  prepareInvokeArgs: function(args, defaults) {
    var prepared = _.extend({}, defaults || {}, val(args, {}, _.isPlainObject));
    return Fiber.fn.transform(prepared, function(val) {
      if (_.isArguments(val)) return val;
      return _.castArray(val);
    });
  },

  /**
   * Binds array of `mixins` or mixin to the given object `context`, also you can bind
   * each method of object mixin to context by providing the `innerApply` with true
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
        mixins[i] = Fiber.fn.transform(_.clone(mixins[i]), bindFn);
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
    thisArg = val(thisArg, this);
    for (var key in object)
      object[key] = iteratee.call(thisArg, object[key], key, object);
    return object;
  },

  /**
   * Sets `value` as global variable by the given `key`
   * @param {string} key
   * @param {*} value
   * @param {?boolean} [force=false]
   * @returns {*}
   */
  globalize: function(key, value, force) {
    force = val(force, false, _.isBoolean);
    var hasKey = root && _.has(root, key) || false;
    if ((hasKey && force) || ! hasKey)
      return window[key] = value;
    return value;
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
   * Concatenates arguments into one array,
   * if item is arguments it will be converted to array
   * @params {...args}
   * @returns {Array}
   */
  argsConcat: function() {
    var args = _.toArray(arguments);
    for (var i = 0; i < args.length; i ++)
      if (_.isArguments(args[i])) args[i] = _.toArray(args[i]);
    return Array.prototype.concat.apply([], args);
  },

  /**
   * Concatenates arguments into one array,
   * if item is arguments it will be converted to array
   * @param {number} level
   * @param {...args}
   * @returns {Array}
   */
  argsConcatFlat: function(level) {
    var concatenated = Fiber.fn.argsConcat.apply(Fiber.fn, _.drop(arguments));
    return _.flattenDepth(concatenated, val(level, 1, _.isNumber));
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  proto: function(exclude) {
    return _.omit(Fiber.fn, Fiber.fn.protoExclude.concat(val(exclude, [], _.isArray)));
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

};

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
Fiber.fn.val.notDefined = Fiber.fn.notDefined;

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 * @static
 */
Fiber.fn.val.isDef = function(value) {
  if (! arguments.length) return false;
  return val(value) !== Fiber.fn.notDefined;
};

/**
 * @inheritDoc
 */
var val = Fiber.fn.val;

/**
 * Cache lodash `each` method to use in backward compatibility mode for the previous lodash versions
 * @type {_.each|*|(function((Array|Object), Function=): (Array|Object))}
 */
var each = _.each;

/**
 * Caches Backbone trigger method
 * @type {Function}
 */
var trigger = Backbone.trigger;

/**
 * Adds backward compatibility for lodash `each` method
 * @param {Array|Object} collection
 * @param {Function} iteratee
 * @param {?Object} [scope]
 * @returns {*}
 */
_.each = function(collection, iteratee, scope) {
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
  trigger.apply(Fiber.Globals.events.system, args);
  trigger.apply(this, arguments);
  return this;
};
