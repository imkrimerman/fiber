/**
 * Fiber Class support
 * @type {Object}
 */
Fiber.fn.class = {

  /**
   * Creates function to call constructor and attach lifecycle properties
   * @param {Function} constructor
   * @param {Object} parentClass
   * @returns {FiberClassPreConstructor}
   */
  createConstructorCaller: function(constructor, parentClass) {
    var migration = $private($fn.extensions, 'migration');
    // fallback on constructor as Parent constructor to make available creation without Parent
    parentClass = $val(parentClass, constructor, _.isObject);
    // Return Class constructor wrapper
    return function FiberClass() {
      // Attach Parent Class constructor and Parent prototype to the direct scope of child
      $fn.class.attachSuper(this, parentClass);
      // If we have properties that needs to be migrated to the direct scope (this) of child, then we'll copy
      // migration to this.
      if (! _.isEmpty(constructor[migration])) $fn.copyProps(constructor, this, constructor[migration]);
      // Apply constructor with arguments
      constructor.apply(this, arguments);
      return this;
    };
  },

  /**
   * Creates common class constructor
   * @returns {Function}
   */
  createConstructor: function(defaults) {
    return function(options) {
      $fn.class.handleOptions(this, options, $val(defaults, {}), true);
      $fn.extensions.init(this);
      $fn.apply(this, 'initialize', arguments);
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
    var child, construct = $fn.class.createConstructorCaller;
    // if we don't have any parent then log error and return
    if (! parent) {
      $Log.warn('`Parent` is not provided or not valid, setting to `noop` function', parent);
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
      constructor: _.extend({value: child, enumerable: false}, $fn.descriptor.getLevelDescriptor('public'))
    });
    // Add prototype properties (instance properties) to the subclass, if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);
    // verify if Class has to follow and is following the contracts
    $fn.class.expectFollowing(child);
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
    proto = $fn.merge($fn.class.mixProto(proto));
    var deepProto = $fn.deepProps.handle(proto, Parent)
      , mergedStatics = $fn.merge($fn.class.mixStatics(statics));
    return $fn.class.nativeExtend(Parent, deepProto, mergedStatics);
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
    Parent = $val(Parent, Fiber.Class, $fn.class.isClass);
    // If Parent is string, then try to resolve Class from dependency injection container
    if (_.isString(Parent) && Fiber.hasOwnProperty('container') && Fiber.container.bound(Parent))
      Parent = Fiber.make(Parent);
    // resolve extension list from prototype and statics
    var extensionsToInclude = $fn.extensions.findIncluded(proto, statics);
    // extend parent with dependency injection
    var resolved = $fn.class.extend(Parent, Fiber.resolve(proto, true), Fiber.resolve(statics, true));
    // set resolved extension list to Class to hoist it to direct scope later
    $fn.extensions.setIncluded(resolved, extensionsToInclude);
    return resolved;
  },

  /**
   * Creates simple Class.
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {Function}
   */
  create: function(proto, statics) {
    return $fn.class.extend($fn.class.createConstructor(), proto, statics);
  },

  /**
   * Creates new `Class` with array of arguments
   * @param {Function} Parent
   * @param {Array} args
   * @returns {Object}
   */
  instance: function(Parent, args) {
    if ($fn.class.isInstance(Parent)) Parent = $fn.get(Parent, 'constructor');
    if (! $fn.class.isClass(Parent)) $Log.errorThrow('Cannot instantiate from `Parent` Class - is not a Class or' +
                                                     ' valid instance to retrieve Constructor.');
    function InstanceCreator() {return Parent.apply(this, args)};
    InstanceCreator.prototype = Parent.prototype;
    return new InstanceCreator();
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
    override = $val(override, false);
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
      $fn.class.mix(object, mixin, override);
    else for (var i = 0; i < mixin.length; i ++)
      $fn.class.mix(object, mixin[i], override);
    return this;
  },

  /**
   * Adds mixins to the given `object`
   * @param {Array|Object|Function} proto - Object to add helpers mixin
   * @returns {Array|Object|Function}
   */
  mixProto: function(proto) {
    return $fn.class.mergeExtendMixin('proto', proto);
  },

  /**
   * Adds mixins to the given `statics`
   * @param {Array|Object|Function} statics
   * @returns {Array|Object|Function|*}
   */
  mixStatics: function(statics) {
    return $fn.class.mergeExtendMixin('statics', statics);
  },

  /**
   * Merges extend mixin to the given `object`
   * @param {string|Object} mixin
   * @param {Object|Array|Function} object - Object to add helpers mixin
   * @returns {*}
   */
  mergeExtendMixin: function(mixin, object) {
    mixin = _.isString(mixin) ? $fn.class.getExtendMixin(mixin) : mixin;
    object = $val(object, {});
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
        $fn: $fn.proto(protoExclude),
        $apply: function(Class, method, args, context) {
          return $fn.apply(Class, method, args, context || this);
        },
        $mutate: function(proto, override) {
          return $fn.class.include(this.$super('prototype'), $fn.merge(Fiber.resolve(proto)), override);
        },
        $new: function() {
          return $fn.class.createNew.call(null, this, 'constructor');
        },
        toString: function() {
          return _.get(this, $Config.type.key, '[object Fiber.Class]');
        },
      },
      statics: {
        extend: $fn.delegator.proxy($fn.class.make),
        create: $fn.delegator.proxy($fn.class.createNew, null, 0),
        implement: $fn.delegator.proxy($fn.class.implement),
      }
    };

    return $val(key, false) ? map[key] : map;
  },

  /**
   * Creates new Class instance
   * @param {Function|Object} Class
   * @param {?string} [property]
   * @returns {Object}
   */
  createNew: function(Class, property) {
    var isDef = $isDef(property)
      , parent = _.isString(property) ? _.get(Class, property) : isDef ? property : Class;
    return $fn.class.instance(parent, isDef ? _.drop(arguments) : arguments);
  },

  /**
   * Adds `contract` to the `Class` to check on instantiation
   * @param {Object} Class
   * @param {Object.<Fiber.Contract>} contract
   * @returns {Object}
   */
  implement: function(Class, contract) {
    if (! Fiber.Contract) return Class;
    if (arguments.length === 1 && Class instanceof Fiber.Contract) {
      contract = Class;
      Class = $fn.class.extend({});
    }

    if (_.isString(contract) && _.has(Fiber.Contracts, contract))
      contract = _.get(Fiber.Contracts, contract);
    if (contract instanceof Fiber.Contract) {
      var follows = $val(Class.__follows, {}, _.isPlainObject)
        , ContractClass = $fn.class.nativeExtend(Class);
      ContractClass.__follows = _.extend({}, follows, $fn.createPlain(contract.getName(), contract));
      return ContractClass;
    }

    $Log.errorThrow('`Contract` is not instance of Fiber.Contract', contract);
  },

  /**
   * Attaches `__super__` and `__parent__` objects to child
   * @param {Object} child
   * @param {Function|Object} parent
   * @param {Function} constructor
   * @returns {Object}
   */
  attachSuper: function(child, parent) {
    if (! parent) return child;
    child.$super = function(method, args, scope) {
      var proto = parent.prototype, methodFn;
      if (! arguments.length) return parent;
      if (methodFn = $fn.class.getMethod(proto, method))
        return $fn.applyFn(methodFn, args, scope || this);
      if (method === 'prototype') proto = parent;
      return $fn.get(proto, method);
    };
    child.$superInit = function() {
      return parent.apply(this, arguments);
    };
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
    scope = $val(scope, object, _.isObject);
    if (_.isString(method)) {
      var fn = $fn.class.getMethod(object, method);
      if (_.isFunction(fn)) return _.bind(fn, scope);
    }
    return null;
  },

  /**
   * Returns Class method or void otherwise
   * @param {Object|Function} object
   * @param {string} method
   * @param {*} [defaults]
   * @param {?boolean} [allowFunctions=true]
   * @returns {*}
   */
  getMethod: function(object, method, defaults, allowFunctions) {
    var method = _.get(object.prototype || object, method, defaults);
    if ($val(allowFunctions, true) && ! _.isFunction(method)) return defaults;
    return method;
  },

  /**
   * Returns value of the object's `property`
   * @param {Object} object
   * @param {string} property
   * @param {?boolean} [own=true]
   * @returns {*}
   */
  getProperty: function(object, property, fn) {
    return _[$val(fn, 'result', _.isString)](object.prototype || object, property);
  },

  /**
   * Checks if Class has to follow the contracts
   * @param {Function} Class
   */
  expectFollowing: function(Class) {
    if ($fn.has(Class, '__follows')) {
      $fn.expect(_.every($fn.get(Class, '__follows'), function(contract) {
        return contract instanceof Fiber.Contract && contract.isImplementedBy(Class);
      }), 'Given `Class` is not following the `Contracts`', Class);
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
    methods = $fn.castArr(methods);
    checkerMethod = $fn.class.prepareConditionCheckerMethod(object, checkerMethod);
    condition = _.capitalize($val(condition, 'if'), true);
    for (var i = 0; i < methods.length; i ++) {
      var method = methods[i];
      object[method + condition] = function(abstract, concrete) {
        if (! $fn.applyFn(checkerMethod, arguments)) return object;
        return $fn.apply(object, method, [abstract, concrete]);
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
  prepareConditionCheckerMethod: function(object, method) {
    if (_.isString(method)) method = object[method];
    if (_.isBoolean(method)) method = _.constant(method);
    if (! _.isFunction(method)) return _.constant(true);
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
    if (! scope) return $Log.error('Scope is not provided or not valid', scope);
    options = $val(options, {}, _.isPlainObject);
    return scope.options = $fn.class.handleOptionsDefaults(options, defaults, deep);
  },

  /**
   * Handles options default properties
   * @param {Object} options
   * @param {?Object} [defaults={}]
   * @param {?boolean} [deep=false]
   * @returns {Object}
   */
  handleOptionsDefaults: function(options, defaults, deep) {
    if (! _.isPlainObject(defaults) || _.isEmpty(defaults)) return options;
    _[deep ? 'defaultsDeep' : 'defaults'](options, defaults);
    return options;
  },

  /**
   * Checks if given object is Class constructor
   * @param {*} Class
   * @returns {boolean}
   */
  isClass: function(object) {
    return _.isFunction(object) && object.prototype && object.prototype.constructor;
  },

  /**
   * Checks if given object is instance (not a Class)
   * @param instance
   * @returns {boolean}
   */
  isInstance: function(object) {
    return ! $fn.class.isClass(object) && ! _.isPlainObject(object) && _.isObject(object);
  },

  /**
   * Determines if `object` is one of the Backbone Components
   * @param {Function} instance
   * @returns {boolean}
   */
  isBackboneClass: function(object) {
    return $fn.class.isBackboneInstance(object.prototype);
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
           instance instanceof Backbone.Router ||
           instance instanceof Backbone.Events
  },

  /**
   * Determines what backbone instance is given
   * @param {Object} instance
   * @param {?boolean} [returnAsClass]
   * @returns {boolean}
   */
  whatBackboneInstance: function(instance, returnAsClass) {
    var result = function(type) { return returnAsClass && Backbone[type] || type; };
    switch (true) {
      case instance instanceof Backbone.Model:
        return result('Model');
      case instance instanceof Backbone.Collection:
        return result('Collection');
      case instance instanceof Backbone.View:
        return result('View');
      case instance instanceof Backbone.Router:
        return result('Router');
      case instance instanceof Backbone.Events:
        return result('Events');
      default:
        return false;
    }
  },
};
