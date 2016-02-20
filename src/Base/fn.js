/**
 * Fiber support function
 * @type {Object}
 */
Fiber.fn = {

  /**
   * Extend this Class to create a new one inherithing this one.
   * Also add a helper __super__ object poiting to the parent prototypes methods.
   * {@link https://github.com/sboudrias/class-extend|Check original version of class extend method on Github}
   * @param {Function} parent - Parent to extend
   * @param {?Object} [protoProps] - Prototype properties (available on the instances)
   * @param {?Object} [staticProps] - Static properties (available on the contructor)
   * @return {Function}
   */
  nativeExtend: function(parent?: Function | object, protoProps?: object, staticProps?: object): Function {
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
  val: function(value, defaults, checker?: Function) {
    // if defaults not specified then assign notDefined `$__NULL__$` value
    defaults = arguments.length > 1 ? defaults : val.notDefined;
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
   * Merges array of objects/arrays
   * @param {Array} args - Array of objects/arrays to merge
   * @returns {Array|Object}
   */
  merge: function(array: array): array | object {
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
  apply: function(Class: Function | object, method: string, args?: array, context?: array | object) {
    context = val(context, Class);
    args = val(args, []);

    if (! _.isArray(args) && _.isObject(args))
      args = _.values(args);

    var proto = Class.prototype
      , method = proto[method];

    if (_.isFunction(method)) return method.apply(context, args);
  },

  /**
   * Binds array/hash or one `mixin` to the given `object`
   * @param {Array|Object|Function} mixin
   * @param {Object} object
   * @returns {Array}
   */
  bind: function(mixin: object, object: string) {
    if (! _.isArray(mixin) && ! _.isObject(mixin)) mixin = [mixin];
    return _.map(mixin, function(one) {
      if (_.isFunction(one)) return one.bind(object);
      return one;
    });
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
   * @memberof Fiber.fn#
   */
  isArrayOf: function(array, of) {
    return _.isArray(array) && _.every(array, _['is' + Fiber.fn.string.capitalize(of)]);
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @returns {Object}
   * @memberof Fiber.fn#
   */
  proto: function() {
    var self = this;
    return {
      fn: {
        val: self.val,
        apply: self.apply,
        bind: self.bind,
        merge: self.merge,
        isArrayOf: self.isArrayOf,
      }
    };
  },

};

/**
 * Globally exposed `val` function
 * @var {Function}
 * @global
 */
var val = Fiber.fn.val;

/**
 * Value that can represent not defined state.
 * @type {string}
 * @memberof Fiber.fn.val
 */
val.notDefined = '$__NULL__$';
