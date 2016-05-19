/**
 * Fiber Class support
 * @type {Object}
 */
Fiber.fn.class = {

  /**
   * Creates function to call constructor and attach lifecycle properties
   * @param {function(...)} constructor
   * @param {Object} parentClass
   * @returns {FiberClassPreConstructor}
   */
  createConstructorCaller: function(constructor, parentClass) {
    var migration = $fn.extensions.migrate;
    // fallback on constructor as Parent constructor to make available creation without Parent
    parentClass = $val(parentClass, constructor, $isObj);
    // ensures that contracts will be extended from `parentClass`
    $fn.class.ensureContractsInSync(constructor, parentClass);
    // Return Class constructor wrapper
    return function FiberClass () {
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
   * Ensures that contracts will be extended from `parent` to `child`
   * @param {function(...)|Object} child
   * @param {function(...)|Object} parent
   * @returns {function(...)|Object}
   */
  ensureContractsInSync: function(child, parent) {
    if ($has(parent, $propNames.contract)) {
      if (! $has(child, $propNames.contract)) child[$propNames.contract] = {};
      _.extend(child[$propNames.contract], parent[$propNames.contract]);
    }
    return child;
  },

  /**
   * Creates common class constructor
   * @returns {function(...)}
   */
  createConstructor: function(defaults) {
    return function(options) {
      $fn.apply(this, 'resetEventProperties');
      $fn.class.handleOptions(this, options, $val(defaults, {}), true);
      $fn.extensions.init(this);
      $fn.apply(this, 'initialize', arguments);
    };
  },

  /**
   * Extend this Class to create a new one inheriting this one.
   * Also adds `_super_` object pointing to the parent prototype and `_parent_`
   * pointing to parent constructor.
   * @param  {?Object} [protoProps] - Prototype properties (available on the instances)
   * @param  {?Object} [staticProps] - Static properties (available on the constructor)
   * @return {function(...)}
   */
  nativeExtend: function(parent, protoProps, staticProps) {
    var child, construct = $fn.class.createConstructorCaller;
    // if we don't have any parent then log error and return
    if (! parent) {
      $log.warn('`Parent` is not provided or not valid, setting to `noop` function', parent);
      parent = $fn.noop;
    }
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (! protoProps || ! $has(protoProps, 'constructor')) child = construct(parent);
    else child = construct(protoProps.constructor, parent);
    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);
    // Set the prototype chain to inherit from `parent`
    child.prototype = Object.create(parent.prototype, {
      constructor: _.extend({value: child}, $fn.descriptor.getDescriptor('property'))
    });
    // Add prototype properties (instance properties) to the subclass, if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);
    // verify if Class has to follow and is following the contracts
    $fn.class.expectFollowingContracts(child);
    // and finally return child
    return child;
  },

  /**
   * Fiber Class extend method.
   * Some properties should not be overridden by extend, they should be merge, so we will
   * search for them in given `proto` object and if one is found then we'll merge it with
   * object `prototype` value
   * @param {function(...)|Object} Parent - Parent to extend from
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {function(...)}
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
   * @param {?function(...)|Object} [Parent] - Parent to extend from, default: Empty class
   * @param {?Array|Object} [proto] - Prototype properties (available on the instances)
   * @param {?Array|Object} [statics] - Static properties (available on the constructor)
   * @returns {function(...)}
   */
  make: function(Parent, proto, statics) {
    // check if `Parent` is valid, if not then set simple Fiber Class as a `Parent`
    Parent = $val(Parent, Fiber.Class, $fn.class.isClass);
    // If Parent is string, then try to resolve Class from dependency injection container
    if ($isStr(Parent) && Fiber.hasOwnProperty('container') && Fiber.container.bound(Parent))
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
   * @returns {function(...)}
   */
  create: function(proto, statics) {
    return $fn.class.extend($fn.class.createConstructor(), proto, statics);
  },

  /**
   * Creates new `Class` with array of arguments
   * @param {function(...)} Parent
   * @param {Array} args
   * @returns {Object}
   */
  instance: function(Parent, args) {
    if ($fn.class.isInstance(Parent)) Parent = $get(Parent, 'constructor');
    if (! $fn.class.isClass(Parent)) $log.error('Cannot instantiate from `Parent` Class - is not a Class or' +
                                                ' valid instance to retrieve Constructor.');
    function InstanceCreator () {return Parent.apply(this, $castArr(args))};
    InstanceCreator.prototype = Parent.prototype;
    return new InstanceCreator();
  },

  /**
   * Adds given `mixin` to the `object`. Mixin can be object or function.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|function(...)} object
   * @param {Object|Object.<Fiber.Extension>|function(...)} mixin
   * @param {?boolean} [override]
   * @returns {Object|function(...)}
   */
  mix: function(object, mixin, override) {
    override = $val(override, false);
    // If mixin is function then it will be called with given `object`.
    if ($isFn(mixin)) return mixin(object);
    if ($fn.extensions.isExtension(mixin)) mixin = mixin.getCode();
    if ($isPlain(mixin)) {
      var method = 'defaultsDeep';
      if (override) method = 'extend';
      _[method](object, mixin);
    }
    return object;
  },

  /**
   * Includes `mixin` or array of mixins to the `object`.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|function(...)} object
   * @param {Object|Object[]|function(...)[]} mixin
   * @param {?boolean} [override]
   * @returns {Object}
   */
  include: function(object, mixin, override) {
    if (! $isArr(mixin) && ($isPlain(mixin) || $fn.extensions.isExtension(mixin)))
      return $fn.class.mix(object, mixin, override);
    else for (var i = 0; i < mixin.length; i ++)
      object = $fn.class.mix(object, mixin[i], override);
    return object;
  },

  /**
   * Adds mixins to the given `object`
   * @param {Array|Object|function(...)} proto - Object to add helpers mixin
   * @returns {Array|Object|function(...)}
   */
  mixProto: function(proto) {
    return $fn.class.mergeExtendMixin('proto', proto);
  },

  /**
   * Adds mixins to the given `statics`
   * @param {Array|Object|function(...)} statics
   * @returns {Array|Object|function(...)|*}
   */
  mixStatics: function(statics) {
    return $fn.class.mergeExtendMixin('statics', statics);
  },

  /**
   * Merges extend mixin to the given `object`
   * @param {string|Object} mixin
   * @param {Object|Array|function(...)} object - Object to add helpers mixin
   * @returns {*}
   */
  mergeExtendMixin: function(mixin, object) {
    mixin = $isStr(mixin) ? $fn.class.getExtendMixin(mixin) : mixin;
    object = $val(object, {});
    switch (true) {
      case $isArr(object):
        return object.concat(mixin);
      case $isPlain(object):
        return _.merge({}, object, mixin);
      case $isFn(object):
        return _.merge(object, mixin);
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
        $implement: function(contract) {
          $fn.class.implementOwn(this.constructor, contract);
          return this;
        },
        $mutate: $fn.delegate($fn.class.mutate),
        $new: $fn.delegate($fn.class.createNew),
        toString: function() {
          return $get(this, $propNames.type, $fn.types.parseSignature(this));
        },
      },
      statics: {
        extend: $fn.delegate($fn.class.make),
        create: $fn.delegate($fn.class.createNew),
        implement: $fn.delegate($fn.class.implement),
        implemented: $fn.delegate($fn.class.implementOwn),
        mutate: $fn.delegate($fn.class.mutate),
      }
    };

    return $val(key, false) ? map[key] : map;
  },

  /**
   * Creates new Class instance
   * @param {function(...)|Object} object
   * @param {?string} [property]
   * @returns {Object}
   */
  createNew: function(object) {
    var parent = $fn.class.isClass(object) ? object : $get(object, 'constructor');
    return $fn.class.instance(parent, $drop(arguments));
  },

  /**
   * Mutates object prototype or object it self.
   * @param {function(...)|Function|Object} object
   * @param {Object} proto
   * @returns {function(...)|Function|Object}
   */
  mutate: function(object, proto) {
    var source = $isFn(object.$super) && object.$super('prototype') || object.prototype || object.__proto__;
    $fn.class.include(source, $fn.merge(Fiber.resolve(proto)), true);
    return object;
  },

  /**
   * Extends `object` and adds `contract` to it.
   * @param {Object} object
   * @param {Object.<Fiber.Contract>} contract
   * @returns {Object}
   */
  implement: function(object, contract) {
    return $fn.class.implementOwn.apply(null, $fn.argsConcat($fn.class.nativeExtend(object), $drop(arguments)));
  },

  /**
   * Adds `contract` to the `object`.
   * @param {Object} object
   * @param {Object.<Fiber.Contract>} contract
   * @returns {Object}
   */
  implementOwn: function(object, contract) {
    if (! Fiber.Contract) return object;
    if (arguments.length > 2) contract = $drop(arguments);

    contract = $fn.merge($fn.multi(contract, function(one) {
      one = $isStr(one) ? $get(Fiber.Contracts, one) : one;
      if (one instanceof Fiber.Contract) return $fn.createPlain(one.getName(), one);
      $log.error('`Contract` is not instance of Fiber.Contract.', one);
    }, 'fn.through'));

    var follows = object[$propNames.contract] || {};
    object[$propNames.contract] = $fn.merge(follows, contract);
    return object;
  },

  /**
   * Attaches `_super_` and `_parent_` objects to child
   * @param {Object} child
   * @param {function(...)|Object} parent
   * @param {function(...)} constructor
   * @returns {Object}
   */
  attachSuper: function(child, parent) {
    if (! parent) return child;
    child.$super = function(method, args, scope) {
      if (! arguments.length) return parent;
      var proto = parent.prototype, methodFn = $fn.class.getMethod(proto, method);
      if (methodFn) return $fn.applyFn(methodFn, args, scope || this);
      if (method === 'prototype') proto = parent;
      return $get(proto, method);
    };
    child.$superInit = function() {
      return parent.apply(this, arguments.length === 1 && $isArgs(arguments[0]) ? arguments[0] : arguments);
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
   * @returns {function(...)|null}
   */
  resolveMethod: function(object, method, scope) {
    scope = $val(scope, object, $isObj);
    if ($isStr(method)) {
      var fn = $fn.class.getMethod(object, method);
      if ($isFn(fn)) return $bind(fn, scope);
    }
    return null;
  },

  /**
   * Adds `alias` for the `method` in `object`
   * @param {Object} object
   * @param {string|Object} method
   * @param {string|Array} alias
   * @param {?boolean} [toProto=false]
   * @returns {boolean}
   */
  alias: function(object, method, alias, toProto) {
    if ($isPlain(method)) return _.every(method, function(mAlias, mMethod) {
      return $fn.class.alias(object, mMethod, mAlias, toProto);
    });

    var castedAlias = $castArr(alias);
    var method = $fn.class.getMethod(object, method);
    if (! method) return false;
    for (var i = 0; i < castedAlias.length; i ++) {
      var alias = castedAlias[i];
      if ($val(toProto, false) && object.prototype) object.prototype[alias] = method;
      else object[alias] = method;
    }
    return true;
  },

  /**
   * Proxies `mixin` to the given `object`
   * @param {Object} object
   * @param {Object} mixin
   * @param {boolean} [toProto=false]
   * @returns {Object}
   */
  proxyMixin: function(object, mixin, toProto) {
    return $fn.class.bindMixin(object, mixin, toProto, $fn.proxy);
  },

  /**
   * Delegates `mixin` to the given `object`
   * @param {Object} object
   * @param {Object} mixin
   * @param {boolean} [toProto=false]
   * @returns {Object}
   */
  delegateMixin: function(object, mixin, toProto) {
    return $fn.class.bindMixin(object, mixin, toProto, $fn.delegate);
  },

  /**
   * Binds `mixin` to the given `object` using `bindFn`
   * @param {Object} object
   * @param {Object} mixin
   * @param {boolean} [toProto=false]
   * @param {function(...)|Function} [bindFn]
   * @returns {Object}
   */
  bindMixin: function(object, mixin, toProto, bindFn) {
    bindFn = $val(bindFn, $fn.proxy, $isFn);
    $each(mixin, function(value, property) {
      var container = object;
      if (toProto) container = object.prototype;
      if ($isFn(value)) container[property] = bindFn(value, object);
      else container[property] = value;
    });
    return object;
  },

  /**
   * Returns Class method or void otherwise
   * @param {Object|function(...)} object
   * @param {string} method
   * @param {*} [defaults]
   * @param {?boolean} [allowFunctions=true]
   * @returns {*}
   */
  getMethod: function(object, method, defaults, allowFunctions) {
    var method = $get(object.prototype || object, method, defaults);
    if ($val(allowFunctions, true) && ! $isFn(method)) return defaults;
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
    return _[$val(fn, 'result', $isStr)](object.prototype || object, property);
  },

  /**
   * Checks if Class has to follow the contracts
   * @param {function(...)} Class
   */
  expectFollowingContracts: function(Class) {
    if ($has(Class, $propNames.contract)) {
      $fn.expect(_.every($get(Class, $propNames.contract), function(contract) {
        return contract instanceof Fiber.Contract && contract.isImplementedBy(Class);
      }), 'Given `Class` is not following the `Contracts`' + Class);
    }
  },

  /**
   * Creates condition methods
   * @param {Object} object
   * @param {Array} methods
   * @param {string|function(...)} checkerMethod
   * @param {?string} [condition=if]
   * @returns {Object}
   */
  createConditionMethods: function(object, methods, checkerMethod, condition) {
    methods = $castArr(methods);
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
   * @param {string|function(...)} checkerMethod
   * @returns {function(...)}
   */
  prepareConditionCheckerMethod: function(object, method) {
    if ($isStr(method)) method = object[method];
    if (_.isBoolean(method)) method = $fn.constant(method);
    if (! $isFn(method)) return $fn.constant(true);
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
    if (! scope) return $log.error('Scope is not provided or not valid', scope);
    options = $val(options, {}, [$isPlain, $fn.class.isInstance]);
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
    if (! $isPlain(defaults) || _.isEmpty(defaults)) return options;
    _[deep ? 'defaultsDeep' : 'defaults'](options, defaults);
    return options;
  },

  /**
   * Ensures that class owns properties
   * @param {Object} object
   * @param {Array} properties
   * @returns {Object}
   */
  ensureOwn: function(object, properties) {
    if (! $isObj(object)) return object;
    properties = $castArr(properties);
    for (var i = 0; i < properties.length; i ++) {
      var property = properties[i]
        , propertyValue = $get(object, property);
      if (object.hasOwnProperty(property)) continue;
      $set(object, property, $fn.clone(propertyValue, true));
    }
    return object;
  },

  /**
   * Merges options to object
   * @param {Object} object
   * @param {Object} options
   * @param {Array|string|boolean|function(...)} [willExtend]
   * @param {boolean} [retrieve=true]
   * @returns {Object}
   */
  extendFromOptions: function(object, options, willExtend) {
    willExtend = $result($val(willExtend, []));
    var isArray = $isArr(willExtend);
    if (isArray) options = _.pick(options, $fn.compact(willExtend));
    else if (_.isBoolean(willExtend) && ! willExtend || willExtend !== 'all') return object;
    return _.extend(object, options);
  },

  /**
   * Checks if given object is Class constructor
   * @param {*} Class
   * @returns {boolean}
   */
  isClass: function(object) {
    return $isFn(object) && object.prototype && object.prototype.constructor;
  },

  /**
   * Checks if given object is instance (not a Class)
   * @param instance
   * @returns {boolean}
   */
  isInstance: function(object) {
    return ! $fn.class.isClass(object) && ! $isPlain(object) && $isObj(object);
  },

  /**
   * Determines if `object` is one of the Backbone Components
   * @param {function(...)} instance
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
   * Determines if object is implementing one or many contracts
   * @param {Object} object
   * @param {string|Array|Object.<Fiber.Contract>} contract
   * @param {string} [fn='every']
   * @returns {boolean}
   */
  isImplementing: function(object, contract, fn) {
    if ($isPlain(object)) return false;
    fn = $valIncludes(fn, 'every');
    var source = object.prototype || object;
    contract = $fn.compact(_.map($castArr(contract), function(one) {
      if ($isStr(one) && Fiber.Contracts.hasOwnProperty(one)) return Fiber.Contracts[one];
      else if (one instanceof Fiber.Contract) return one;
      return null;
    }));
    return _.every(contract, function(oneContract) {
      return _[fn](oneContract.get(), function(type, property) {
        var value = $get(source, property, $val.notDefined);
        return $fn.types.matches(value, type);
      });
    });
  },

  /**
   * Determines if `object` can be synced with the server
   * @param {Object} object
   * @returns {boolean}
   */
  isSyncable: function(object) {
    object = object.prototype || object;
    return object instanceof Backbone.Model || object instanceof Backbone.Collection;
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
  }
};
