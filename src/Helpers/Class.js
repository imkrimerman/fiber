/**
 * Fiber Class support
 * @var {Object}
 */
Fiber.fn.class = {

  /**
   * List of deep extend properties
   * @var {Array}
   */
  deepProperties: ['hidden', 'extendable', 'ownProps', 'extensions', 'events', 'eventsCatalog'],

  /**
   * Extend mixin
   * @var {Object}
   */
  extendMixin: function () {
    return { extend: Fiber.fn.proxy(Fiber.fn.class.make) };
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
    proto = Fiber.fn.merge(Fiber.fn.class.mixProto(proto));
    statics = Fiber.fn.merge(Fiber.fn.class.mixExtend(statics));
    return Fiber.fn.nativeExtend(Parent, Fiber.fn.class.deepExtendProperties(proto, Parent), statics);
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
    if (_.isString(Parent) && Fiber.Ioc.has(Parent)) Parent = Fiber.Ioc.get(Parent);
    // Finally call extend method with right Parent, proto and statics
    return Fiber.fn.class.extend(
      Parent,
      Fiber.getExtension(val(proto, {})),
      Fiber.getExtension(val(statics, {}))
    );
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
   * Deeply extends properties to the given `child` object
   * @param {Object} child - Child hash object to apply deep extend
   * @param {Object|Function} [parent = {}] - Class or instance to extend from
   * @param {?Array} [properties] - Properties to extend (optional), default: {@link
   *   Fiber.fn.class.deepExtendProperties}
   * @returns {Object|Array|*}
   */
  deepExtendProperties: function(child, parent, properties) {
    if (! child) return child;
    if (! parent) parent = {};
    // if `properties` not provided or not is array, then we'll use Fiber global properties
    properties = val(properties, Fiber.fn.class.deepProperties, _.isArray);
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
   * Makes new `Class` instance.
   * @param {Function} Parent - Class to create new instance from
   * @param {?Array} [args] - Arguments to pass to Class constructor
   * @returns {Object}
   */
  makeInstance: function(Parent, args) {
    var Class = function() { return Parent.apply(this, args || []); };
    Class.prototype = Parent.prototype;
    return new Class();
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
   * Extends Backbone Class with all available extensions
   * @param {string} backboneClass - Backbone class to extend (Model, Collection, View, Router)
   * @param {?Array|Object} [proto] - Additional list of prototypes to mix to child Class
   * @returns {Function|null}
   */
  makeExtended: function(backboneClass, proto) {
    backboneClass = _.capitalize(backboneClass, true)

    var Parent = Backbone[backboneClass]
      , excludeAccessFrom = ['Model', 'Collection']
      , excludedExtensions = [];

    if (_.includes(excludeAccessFrom, backboneClass))
      excludedExtensions.push('Access');

    if (! Parent) return null;

    var extender = Fiber.getExtensionsList(excludedExtensions);
    return Fiber.fn.class.make(Parent, extender.concat(_.castArray(proto)));
  },

  /**
   * Adds function helpers to the given `object`
   * @param {Object} object - Object to add helpers mixin
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  mixProto: function(object, exclude) {
    object = val(object, {});
    var proto = Fiber.fn.proto(exclude);
    switch (true) {
      case _.isArray(object): return object.concat(proto);
      case _.isPlainObject(object) || _.isFunction(object): return _.extend(object, proto);
      default: return object;
    }
  },

  /**
   * Adds extend function to the given `statics`
   * @param {Array|Object|Function} statics
   * @returns {Array|Object|Function|*}
   */
  mixExtend: function(statics) {
    statics = val(statics, {});
    var mixin = Fiber.fn.class.extendMixin();
    switch (true) {
      case _.isArray(statics):
        return statics.concat(mixin);
      case _.isPlainObject(statics) || _.isFunction(statics):
        return _.extend(statics, mixin);
      default: return statics;
    }
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
