/**
 * Fiber Class support
 * @type {Object}
 */
Fiber.fn.class = {

  /**
   * Creates pre constructor function to execute constructor and attach inheritance chain
   * @param {Function} constructor
   * @param {Object} parentClass
   * @returns {FiberClassPreConstructor}
   */
  createPreConstructor: function (constructor, parentClass) {
    parentClass = val(parentClass, constructor, _.isObject);
    return function FiberClass() {
      Fiber.fn.class.attachSuper(this, parentClass);
      constructor.apply(this, arguments);
      return this;
    };
  },

  /**
   * Extend this Class to create a new one inheriting this one.
   * Also adds `__super__` object pointing to the parent prototype and `__parent__`
   * pointing to parent constructor.
   * @param  {?Object} [protoProps] - Prototype properties (available on the instances)
   * @param  {?Object} [staticProps] - Static properties (available on the constructor)
   * @return {Function}
   */
  nativeExtend: function(parent, protoProps, staticProps) {
    var child, construct = Fiber.fn.class.createPreConstructor;
    // if we don't have any parent then log error and return
    if (! parent) {
      Fiber.internal.logger.debug('Parent is not provided or not valid, setting to simple function', parent);
      parent = _.noop;
    }
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (! protoProps || ! _.has(protoProps, 'constructor')) child = construct(parent);
    else child = construct(protoProps.constructor, parent);
    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);
    // Set the prototype chain to inherit from `parent`
    child.prototype = Object.create(parent.prototype, {
      constructor: {value: child, enumerable: false, writable: true, configurable: true}
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
    proto = Fiber.fn.merge(Fiber.fn.class.mixProto(proto));
    var deepProto = Fiber.fn.deepProps.handle(proto, Parent)
      , mergedStatics = Fiber.fn.merge(Fiber.fn.class.mixStatics(statics));
    return Fiber.fn.class.nativeExtend(Parent, deepProto, mergedStatics);
  },

  /**
   * Makes new class from `Parent` using extender, statics and extensions.
   * You can provide a string in `proto` or `statics` to auto resolve and inject extensions
   * @param {?Function|Object} [Parent] - Parent to extend from, default: Empty class
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  make: function(Parent, proto, statics) {
    // check if `Parent` is valid, if not then set simple Fiber Class as a `Parent`
    Parent = val(Parent, Fiber.Class);
    // If Parent is string, then try to resolve Class from dependency injection container
    if (_.isString(Parent) && Fiber.has('container') && Fiber.container.bound(Parent)) {
      Parent = Fiber.container.make(Parent);
    }
    //todo: add all container bags resolve, not only extensions
    // Finally call extend method with right Parent, proto and statics
    return Fiber.fn.class.extend(Parent, Fiber.getExtension(proto), Fiber.getExtension(statics));
  },

  /**
   * Creates simple Class. Includes Fiber Events
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  create: function(proto, statics) {
    return Fiber.fn.class.extend(_.noop, proto, statics);
  },

  /**
   * Creates Class that includes Backbone Events and all Extensions
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  createWithExtensions: function(proto, statics) {
    var mergeable = _.castArray(proto).concat(Fiber.Events)
      , extensions = Fiber.getExtensionList()
      , Parent = Fiber.fn.class.createConstructor(extensions);

    extensions = _.values(extensions).map(function(extension) {
      return extension.getCodeCapsule();
    });

    proto = Fiber.fn.merge(extensions, mergeable);
    return Fiber.fn.class.extend(Parent, proto, statics);
  },

  /**
   * Creates constructor for class with mixins that auto applies mixins on construct
   * @param {Array.<Object>} mixins
   * @returns {Function}
   */
  createConstructor: function(extensions) {
    return function(options) {
      Fiber.fn.class.handleOptions(this, options);
      Fiber.fn.extensions.init(this, options, extensions);
      Fiber.fn.class.setExtensions(this, extensions);
      Fiber.fn.apply(this, 'initialize', arguments);
    };
  },

  /**
   * Returns extensions list that associated with given `object`
   * @param {Object} object
   * @returns {Array|null}
   */
  getExtensions: function(object) {
    var key = Fiber.Constants.extensions.property;
    if (! object[key]) return null;
    return object[key];
  },

  /**
   * Sets extensions list to the private registry of the `object`
   * @param {Object} object
   * @param {Array|string} list
   * @returns {Array}
   */
  setExtensions: function(object, list) {
    var key = Fiber.Constants.extensions.property;
    if (! _.has(object, key)) object[key] = [];
    if (! _.isString(list) && ! Fiber.fn.isArrayOf(list, 'string')) return object[key];
    return object[key] = _.compact(_.uniq(object[key].concat(_.castArray(list))));
  },

  /**
   * Checks if object has extensions associated
   * @param {Object} object
   * @returns {boolean}
   */
  hasExtensions: function(object) {
    return _.has(object, Fiber.Constants.extensions.property);
  },

  /**
   * Composes View with provided options
   * @param {Function} View
   * @param {?Object} [options]
   * @param {...args}
   * @returns {*|Function|Fiber.View}
   */
  composeView: function(View, options) {
    if (! (Fiber.fn.class.isBackbone(View)))
      Fiber.internal.logger.errorThrow('View cannot be composed', View, options);

    options = val(options, {}, _.isPlainObject);

    var args = _.drop(arguments, 2)
      , CollectionClass = options.Collection
      , ModelClass = options.Model
      , hasCollection = ! _.isEmpty(CollectionClass)
      , hasModel = ! _.isEmpty(ModelClass)
      , util = Fiber.fn.class
      , defaults = {};

    if (hasCollection) defaults = {
      collection: util.composeCollection(CollectionClass, (hasModel ? ModelClass : null))
    };
    else if (hasModel) defaults = {
      model: util.compose(ModelClass)
    };

    return util.compose.apply(null, [View, defaults].concat(args));
  },

  /**
   * Composes Collection
   * @param {Array|Function} Collection
   * @param {?Array|Function} [Model]
   * @param {...args}
   * @returns {Function}
   */
  composeCollection: function(Collection, Model) {
    var args = _.drop(arguments, 2)
      , util = Fiber.fn.class;

    if (! Model) {
      if (! args.length) return Collection;
      return util.compose.apply(null, [Collection].concat(args));
    }

    var model = {model: util.compose(Model)};
    return util.compose.apply(null, [Collection, model].concat(args));
  },

  /**
   * Composes Component
   * @param {Array|Function} Component
   * @param {...args}
   * @returns {Function}
   */
  compose: function(Component) {
    var args = _.drop(arguments);

    if (_.isArray(Component)) {
      args = _.drop(Component).concat(args);
      Component = _.first(Component);
    }

    if (! args.length) return new Component;
    return Fiber.fn.class.makeInstanceWithArgs(Component, args);
  },

  /**
   * Determines if `Class` is one of the Backbone Components
   * @param {Function} instance
   * @returns {boolean}
   */
  isBackbone: function(Class) {
    return Fiber.fn.class.isBackboneInstance(Class.prototype);
  },

  /**
   * Checks if given Class is Class constructor
   * @param {*} Class
   * @returns {boolean}
   */
  isClass: function(Class) {
    return _.isFunction(Class);
  },

  /**
   * Determines if `instance` is one of the Backbone Components
   * @param {Object} instance
   * @returns {boolean}
   */
  isBackboneInstance: function(instance) {
    return instance instanceof Backbone.Model ||
           instance instanceof Backbone.Collection ||
           instance instanceof Backbone.View ||
           instance instanceof Backbone.Router
  },

  /**
   * Creates new `Class` with array of arguments
   * @param {Function} Parent
   * @param {Array} args
   * @returns {Object}
   */
  makeInstanceWithArgs: function(Parent, args) {
    function ClassApplier() {return Parent.apply(this, args)};
    ClassApplier.prototype = Parent.prototype;
    return new ClassApplier();
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
    // If mixin is function then it will be called with given `object`.
    if (_.isFunction(mixin)) return mixin(object);
    else if (_.isPlainObject(mixin)) {
      var method = 'defaultsDeep';
      if (override) method = 'extend';
      _[method](object, mixin);
    }
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
   * @returns {Array|Object|Function}
   */
  mixProto: function(proto) {
    return Fiber.fn.class.mergeExtendMixin('proto', proto);
  },

  /**
   * Adds mixins to the given `statics`
   * @param {Array|Object|Function} statics
   * @returns {Array|Object|Function|*}
   */
  mixStatics: function(statics) {
    return Fiber.fn.class.mergeExtendMixin('statics', statics);
  },

  /**
   * Merges extend mixin to the given `object`
   * @param {string|Object} mixin
   * @param {Object|Array|Function} object - Object to add helpers mixin
   * @returns {*}
   */
  mergeExtendMixin: function(mixin, object) {
    mixin = _.isString(mixin) ? Fiber.fn.class.getExtendMixin(mixin) : mixin;
    object = val(object, {});
    switch (true) {
      case _.isArray(object):
        return object.concat(mixin);
      case _.isPlainObject(object) || _.isFunction(object):
        return _.merge({}, object, mixin);
      default:
        return object;
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
        fn: Fiber.fn.proto(protoExclude),
        apply: function(Class, method, args, context) {
          return Fiber.fn.apply(Class, method, args, context || this);
        }
      },
      statics: {extend: Fiber.fn.delegator.proxy(Fiber.fn.class.make)}
    };

    return val(key, false) ? map[key] : map;
  },

  /**
   * Attaches `__super__` and `__parent__` objects to child
   * @param {Object} child
   * @param {Function|Object} parent
   * @returns {Object}
   */
  attachSuper: function(child, parent) {
    if (! parent) return child;
    child.__super__ = parent.prototype;
    child.__parent__ = parent;
    return child;
  },

  /**
   * Resolves `method` from the given `object`.
   * If `bind` argument is provided, then we'll decide if we need to bind object context to the method
   * If method not found then null will be returned
   * @param {Object} object - Object to resolve method from
   * @param {string} method - Method key (string) to resolve
   * @param {?Object} [scope] - binds `scope` object to method
   * @returns {Function|null}
   */
  resolveMethod: function(object, method, scope) {
    scope = val(scope, object, _.isObject);
    if (_.isString(method) && object[method] && _.isFunction(object[method])) {
      var fn = Fiber.fn.class.getMethod(object, method);
      return scope ? fn.bind(scope) : fn;
    }
    return null;
  },

  /**
   * Returns Class method or void otherwise
   * @param {Object|Function} object
   * @param {string} method
   * @returns {Function|null}
   */
  getMethod: function(object, method) {
    object = object.prototype || object;
    return _.get(object, method);
  },

  /**
   * Returns value of the object's `property`
   * @param {Object} object
   * @param {string} property
   * @param {?boolean} [own=true]
   * @returns {*}
   */
  getProperty: function(object, property, own) {
    object = object.prototype || object;
    own = val(own, true, _.isBoolean);
    return Fiber.fn.result(property, object, own);
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
    checkerMethod = Fiber.fn.class.prepareConditionCheckerMethod(object, checkerMethod);
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
   * Verifies that `options` is plain object and sets options to the scope
   * @param {Object} scope
   * @param {Object} options
   * @param {?Object} [defaults={}]
   * @param {?boolean} [deep=false]
   * @returns {Object}
   */
  handleOptions: function(scope, options, defaults, deep) {
    if (! scope) Fiber.internal.logger.error('Scope is not provided or not valid', scope);
    options = val(options, {}, _.isPlainObject);
    return scope.options = Fiber.fn.class.handleOptionsDefaults(options, defaults, deep);
  },

  /**
   * Handles options defaults
   * @param {Object} options
   * @param {?Object} [defaults={}]
   * @param {?boolean} [deep=false]
   * @returns {Object}
   */
  handleOptionsDefaults: function(options, defaults, deep) {
    if (! _.isPlainObject(defaults) || _.isEmpty(defaults)) return options;
    if (deep) _.defaultsDeep(options, defaults);
    else _.defaults(options, defaults);
    return options;
  },
};
