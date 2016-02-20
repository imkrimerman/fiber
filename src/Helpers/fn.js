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

  // Gets value by given `property` key. You can provide `defaults` value that
  // will be returned if value is not found by the given key. If `defaults` is
  // not provided that defaults will be set to `null`
  get: function(object, property, defaults) {
    return _.get(object, property, val(defaults, null));
  },

  // Sets `value` by given `property` key
  set: function(object, property, value) {
    _.set(object, property, value);
    return object;
  },

  // Checks if Class has given `property`
  has: function(object, property) {
    return _.has(object, property);
  },

  // Gets value by given `property` key, if `property` value is function then it will be called.
  // You can provide `defaults` value that will be returned if value is not found
  // by the given key. If `defaults` is not provided that defaults will be set to `null`
  result: function(object, property, defaults) {
    return _.result(object, property, val(defaults, null));
  },

  // Removes `value` by given `property` key
  forget: function(object, property) {
    _.unset(object, property);
    return object;
  },

  /**
   * Extend this Class to create a new one inheriting this one.
   * Also add a helper __super__ object pointing to the parent prototypes methods.
   * {@link https://github.com/sboudrias/class-extend|Check original version of class extend method on Github}
   * @param  {?Object} [protoProps] - Prototype properties (available on the instances)
   * @param  {?Object} [staticProps] - Static properties (available on the constructor)
   * @return {Function}
   */
  nativeExtend: function(parent, protoProps, staticProps) {
    if (! parent) return parent;
    var child;
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (! protoProps || ! _.has(protoProps, 'constructor'))
      child = function() { return parent.apply(this, arguments); };
    else child = protoProps.constructor;
    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);
    // Set the prototype chain to inherit from `parent`
    child.prototype = Object.create(parent.prototype, {
      constructor: { value: child, enumerable: false, writable: true, configurable: true }
    });
    // Add prototype properties (instance properties) to the subclass, if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);
    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;
    // and finally return child
    return child;
  },

  /**
   * Returns value if not undefined or null,
   * otherwise returns defaults or $__NULL__$ value
   * @see https://github.com/imkrimerman/im.val (npm version)
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {?Function} [checker] - function to call to check validity
   * @returns {*}
   */
  val: function(value, defaults, checker) {
    // if defaults not specified then assign notDefined `$__NULL__$` value
    defaults = arguments.length > 1 ? defaults : Fiber.fn.notDefined;
    // if we don't have any `value` then return `defaults`
    if (! arguments.length) return defaults;
    // if value and checker is specified then use it to additionally check value
    if (_.isFunction(checker) && value != null) {
      // if checker returns true then we are good
      if (checker(value)) return value;
      // otherwise return defaults
      return defaults;
    }
    // if value not specified return defaults, otherwise return value;
    return value != null ? value : defaults;
  },

  /**
   * Merges multiple objects or arrays into one.
   * @param {Array} args - Array of objects/arrays to merge
   * @returns {Array|Object}
   */
  merge: function(array) {
    if (arguments.length > 1) array = _.toArray(arguments);
    if (! _.isArray(array)) return array;
    if (Fiber.fn.isArrayOf(array, 'object'))
      return _.extend.apply(_, [{}].concat(array));
    else if (Fiber.fn.isArrayOf(array, 'array'))
      return _.flattenDeep(array);
    return array;
  },

  /**
   * Applies `method` on given `Class` with `context` and passing `args`
   * @param {Function|Object} Class - Class to call
   * @param {String} method - method to call
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [context] - context to apply to
   * @returns {*}
   */
  apply: function(Class, method, args, context) {
    context = val(context, Class);
    args = val(args, []);

    var proto = Class.prototype
      , method = proto && proto[method];

    if (_.isFunction(method)) return method.apply(context, _.castArray(args));
  },

  /**
   * Binds array of `mixins`, object or function to the given object `context`,
   * also you can bind each methods context too by providing the `innerApply` with true
   * @param {Array|Object|Function} mixins
   * @param {Object} ctx
   * @param {?boolean} [innerApply=false]
   * @returns {Array|Object|Function}
   */
  bind: function(mixins, ctx, innerApply) {
    var wasArray = _.isArray(mixins);

    innerApply = val(innerApply, false, _.isBoolean);
    mixins = _.castArray(mixins);

    for (var i = 0; i < mixins.length; i ++)
      if (innerApply && (_.isPlainObject(mixins[i]) || _.isArray(mixins[i])))
        mixins[i] = Fiber.fn.bind(mixins[i], ctx, innerApply);
      else mixins[i] = _.bind(mixins[i], ctx);

    return wasArray ? mixins : _.first(mixins);
  },

  /**
   * Proxies function
   * @param {Function} fn
   * @returns {Function}
   */
  proxy: function(fn) {
    return function() {
      var args = _.toArray(arguments);
      return fn.apply(fn, [this].concat(args));
    };
  },

  /**
   * Checks if given array is array with objects
   * @param {Array} array - Array to check
   * @param {string} of - String of type (object, string, array ...etc)
   * @returns {boolean}
   */
  isArrayOf: function(array, of) {
    return _.isArray(array) && _.every(array, _['is' + Fiber.fn.string.capitalize(of)]);
  },

  /**
   * Checks if `array` contains given `value`
   * @param {Array} array - Array to check
   * @param {*} value - Value to search in array
   * @returns {boolean}
   */
  inArray: function(array, value) {
    if (! _.isArray(array)) return false;
    var i = array.length;
    while (i--) if (array[i] === value) return true;
    return false;
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  proto: function(exclude) {
    return {
      fn: _.omit(Fiber.fn, Fiber.fn.protoExclude.concat(val(exclude, [], _.isArray)))
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
 * Globally exposed `val` function
 * @type {Function}
 */
var val = Fiber.fn.val;
