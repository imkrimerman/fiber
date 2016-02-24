/**
 * Fiber Class support
 * @var {Object}
 */
Fiber.fn.class = {

  /**
   * Deep properties configuration
   * @var {Object}
   */
  deepProperties: {
    rules: [_.isArray, _.isPlainObject],
    explore: [
      [Fiber, 'ioc.binding.items'],
      [Fiber, 'ioc.extensions.items'],
      [Fiber, 'Model.prototype'],
    ],
  },

  /**
   * Returns list of explored deep extend properties
   * @return {Array}
   */
  exploreDeepProperties: function(explorables, rules, comparatorFn) {
    var properties = [];

    explorables = _.castArray(val(explorables, this.deepProperties.explore));
    rules = _.castArray(val(rules, this.deepProperties.rules));
    comparatorFn = val(comparatorFn, 'some', function(val) {
      return _.includes(['some', 'every'], val);
    });

    for (var i = 0; i < explorables.length; i ++) {
      var owner = explorables[i][0]
        , propHolder = owner[explorables[i][1]];

      if (! propHolder || ! _.isPlainObject(propHolder)) continue;

      for (var key in propHolder)
        if (this.validateDeepProperty(key, rules, comparatorFn))
          properties.push(key);
    }

    return properties;
  },

  /**
   * Validates deep property
   * @param {*} property
   * @param {Array|Function} rules
   * @param {string} comparatorFn
   * @returns {boolean}
   */
  validateDeepProperty: function(property, rules, comparatorFn) {
    if (! rules || ! comparatorFn) return false;
    return _[comparatorFn](_.castArray(rules), function(rule) {
      return rule(property);
    });
  },

  /**
   * Deeply extends properties to the given `child` object
   * @param {Object} child - Child hash object to apply deep extend
   * @param {Object|Function} [parent = {}] - Class or instance to extend from
   * @param {?Array} [properties] - Properties to extend (optional), default: auto explored options
   * @returns {Object|Array|*}
   */
  deepExtendProperties: function(child, parent, properties) {
    if (! child) return child;
    if (! parent) parent = {};
    // if `properties` not provided or not is array, then we'll use Fiber global properties
    properties = val(properties, Fiber.fn.class.exploreDeepProperties(), _.isArray);
    // traverse each property
    _.each(properties, function(property) {
      // check and grab `property` from `parent` object prototype
      var objProtoProp = _.has(parent.prototype, property) && parent.prototype[property];
      // if we don't have given `property` in `child` or in `parent` object prototype
      // then we'll return same `child` object
      if (! _.has(child, property) || ! objProtoProp) return child;
      // if `property` value is array then concatenate `parent` object with `child` object
      if (_.isArray(child[property])) child[property] = objProtoProp.concat(child[property]);
      // else if it's plain object then extend `child` object from `parent` object
      else if (_.isPlainObject(child[property])) child[property] = _.extend({}, child[property], objProtoProp);
    });
    return child;
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
   * Fiber Class extend method.
   * Some properties should not be overridden by extend, they should be merge, so we will
   * search for them in given `proto` object and if one is found then we'll merge it with
   * object `prototype` value
   * @param {Function|Object} Parent - Parent to extend from
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  extend: function(Parent, proto, statics) {
    var fn = Fiber.fn.class, merge = Fiber.fn.merge;
    proto = fn.deepExtendProperties(merge(fn.mixProto(proto)), Parent);
    return fn.nativeExtend(Parent, proto, merge(fn.mixStatics(statics)));
  },

  /**
   * Makes new class from `Parent` using extender, statics and extensions.
   * You can provide a string in `proto` or `statics` to auto resolve and inject extensions
   * @param {?Function|Object} [Parent] - Parent to extend from, default: {@link Fiber.Class}
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  make: function(Parent, proto, statics) {
    Parent = val(Parent, Fiber.Class);
    // If Parent is string, then try to resolve Class from dependency injection container
    if (_.isString(Parent) && Fiber.ioc.bound(Parent)) Parent = Fiber.ioc.make(Parent);
    // Finally call extend method with right Parent, proto and statics
    return Fiber.fn.class.extend(Parent, Fiber.getExtension(proto), Fiber.getExtension(statics));
  },

  /**
   * Adds given `mixin` to the `object`. Mixin can be object or function.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|Function} object
   * @param {Object|Function} mixin
   * @param {?boolean} [override]
   * @returns {Object|Function}
   */
  mix: function(object, mixin, override) {
    override = val(override, false);
    // If function is given then it will be called with current Class.
    if (_.isFunction(mixin)) return mixin(object);
    var method = 'defaultsDeep';
    if (override) method = 'extend';
    _[method](object, mixin);
    return object;
  },

  /**
   * Includes `mixin` or array of mixins to the `object`.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|Function} object
   * @param {Object|Object[]|Function[]} mixin
   * @param {?boolean} [override]
   * @returns {Fiber.fn.class}
   */
  include: function(object, mixin, override) {
    if (! _.isArray(mixin) && _.isPlainObject(mixin))
      Fiber.fn.class.mix(object, mixin, override);
    else for (var i = 0; i < mixin.length; i ++)
      Fiber.fn.class.mix(object, mixin[i], override);
    return this;
  },

  /**
   * Adds mixins to the given `object`
   * @param {Array|Object|Function} proto - Object to add helpers mixin
   * @param {?Array|String} [exclude] - Array of properties to exclude from functions object
   * @returns {Array|Object|Function}
   */
  mixProto: function(proto, exclude) {
    return Fiber.fn.class.mergeExtendMix(Fiber.fn.class.getExtendMixin('proto', exclude), proto);
  },

  /**
   * Adds mixins to the given `statics`
   * @param {Array|Object|Function} statics
   * @returns {Array|Object|Function|*}
   */
  mixStatics: function(statics) {
    return Fiber.fn.class.mergeExtendMix(Fiber.fn.class.getExtendMixin('statics'), object);
  },

  /**
   * Merges extend mixin to the given `object`object
   * @param {Object} mixin
   * @param {Object|Array|Function} object - Object to add helpers mixin
   * @returns {*}
   */
  mergeExtendMix: function(mixin, object) {
    object = val(object, {});
    switch (true) {
      case _.isArray(object): return object.concat(mixin);
      case _.isPlainObject(object) || _.isFunction(object): return _.merge({}, object, mixin);
      default: return object;
    }
  },

  /**
   * Returns mixin for extend
   * @param {?string} [key]
   * @param {?Array|String} protoExclude
   * @returns {Object}
   */
  getExtendMixin: function(key, protoExclude) {
    var map = {
      proto: {
        fn: Fiber.fn.proto(protoExclude)
      },

      statics: {
        extend: Fiber.fn.delegator.proxy(Fiber.fn.class.make)
      }
    };

    return val(key, false) ? map[key] : map;
  },

  /**
   * Resolves `method` from the given `object`.
   * If `bind` argument is provided, then we'll decide if we need to bind object context to the method
   * If method not found then null will be returned
   * @param {Object} object - Object to resolve method from
   * @param {string} method - Method key (string) to resolve
   * @param {?boolean} [bind] - Flag to auto bind object context to method
   * @returns {Function|null}
   */
  resolveMethod: function(object, method, bind) {
    bind = val(bind, true, _.isBoolean);
    if (_.isString(method) && object[method] && _.isFunction(object[method])) {
      var resolved = object[method];
      return bind ? resolved.bind(object) : resolved;
    }
    return null;
  },

  /**
   * Creates condition methods
   * @param {Object} object
   * @param {Array} methods
   * @param {string|Function} checkerMethod
   * @param {?string} [condition=if]
   * @returns {Object}
   */
  createConditionMethods: function(object, methods, checkerMethod, condition) {
    methods = _.castArray(methods);
    checkerMethod = this.prepareConditionCheckerMethod(object, checkerMethod);
    condition = _.capitalize(val(condition, 'if'), true);
    for (var i = 0; i < methods.length; i ++) {
      var method = methods[i];
      object[method + condition] = function(abstract, concrete) {
        if (! checkerMethod(abstract)) object[method](abstract, concrete);
        return object;
      };
    }
    return object;
  },

  /**
   * Prepares checker method for conditional methods
   * @param {Object} object
   * @param {string|Function} checkerMethod
   * @returns {Function}
   */
  prepareConditionCheckerMethod: function(object, checkerMethod) {
    if (_.isString(checkerMethod)) checkerMethod = object[checkerMethod];
    if (_.isBoolean(checkerMethod)) checkerMethod = _.constant(checkerMethod);
    if (! _.isFunction(checkerMethod)) return _.constant(true);
  },

  /**
   * Creates simple Class with Backbone Events
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  createClass: function(proto, statics) {
    return Fiber.fn.class.extend(_.noop, proto, statics);
  },
};
