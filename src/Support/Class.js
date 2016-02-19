/**
 * Fiber Class support
 * @type {Object}
 * @memberof Fiber.fn#
 */
Fiber.fn.class = {

  /**
   * List of deep extend properties
   * @var {Array}
   * @memberof Fiber.fn.class#
   */
  deepProperties: ['hidden', 'extendable', 'ownProps', 'extensions', 'events', 'eventsCatalog'],

  /**
   * Fiber Class extend method.
   * Some properties should not be overridden by extend, they should be merge, so we will
   * search for them in given `proto` object and if one is found then we'll merge it with
   * object `prototype` value
   * @param {Function|Object} parent - Parent to extend from
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   * @memberof Fiber.fn.class#
   */
  extend: function(parent, proto, statics) {
    return Fiber.fn.nativeExtend(
      parent,
      Fiber.fn.class.deepExtendProperties(Fiber.fn.merge(proto), this),
      Fiber.fn.merge(statics)
    );
  },

  /**
   * Makes new class from `parent` using extender, statics and extensions.
   * You can provide a string in `extender` or `statics` to auto resolve and inject extensions
   * @param {?Function|Object} [parent] - Parent to extend from, default: {@link Fiber.Class}
   * @param {?Array|Object} [extender] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   * @memberof Fiber.fn.class#
   */
  make: function(parent, extender, statics) {
    parent = val(parent, Fiber.Class);
    // If parent is string, then try to resolve Class from dependency injection container
    if (_.isString(parent) && Fiber.Ioc.has(parent)) parent = Fiber.Ioc.get(parent);
    // Finally call extend method with right parent, proto and statics
    return Fiber.fn.class.extend(
      parent,
      Fiber.getExtension(val(extender, {})),
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
   * @memberof Fiber.fn.class#
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
   * @memberof Fiber.fn.class#
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
   * @param {?Array} [properties] - Properties to extend (optional), default: {@link Fiber.global.deepExtendProperties}
   * @returns {Object|Array|*}
   * @memberof Fiber.fn.class#
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
      else if (_.isPlainObject(child[property])) _.extend(child[property], objProtoProp);
    });
    return child;
  },

  /**
   * Makes new `Class` instance.
   * @param {Function} parent - Class to create new instance from
   * @param {?Array} [args] - Arguments to pass to Class constructor
   * @returns {Object}
   * @memberof Fiber.fn.class#
   */
  makeInstance: function(parent, args) {
    var Class = function() { return parent.apply(this, args || []); };
    Class.prototype = parent.prototype;
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
   * @memberof Fiber.fn.class#
   */
  resolveMethod: function(object, method, bind) {
    bind = val(bind, true, _.isBoolean);
    if (_.isString(method) && object[method]) {
      var resolved = object[method];
      return bind ? resolved.bind(object) : resolved;
    }
    return null;
  }
};
