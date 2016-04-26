/**
 * Fiber Inverse Of Control Container
 * @class
 */
Fiber.Container = $fn.class.create({

  /**
   * The container's bindings bag.
   * @type {Object.<Fiber.Bag>}
   */
  bindings: null,

  /**
   * Extensions bag
   * @type {Object.<Fiber.Bag>}
   */
  extensions: null,

  /**
   * Shared instances bag
   * @type {Object.<Fiber.Bag>}
   */
  shared: null,

  /**
   * Aliases bag
   * @type {Object.<Fiber.Bag>}
   */
  aliases: null,

  /**
   * Bags list
   * @type {Array}
   */
  bags: ['bindings', 'extensions', 'shared', 'aliases'],

  /**
   * Constructs Container
   */
  constructor: function() {
    this.flush();
    $fn.apply(this, 'initialize', [arguments]);
  },

  /**
   * Determine if the given abstract type has been bound.
   * @param {string} abstract
   * @returns {boolean}
   */
  bound: function(abstract) {
    return _.some(this.bags, _.bind(function(bag) {
      return this[bag].has(abstract);
    }, this));
  },

  /**
   * Register a binding with the container.
   * @param {string|Array} abstract
   * @param {*} concrete
   * @param {?boolean} [shared=false]
   * @returns {Fiber.Container}
   */
  bind: function(abstract, concrete, shared) {
    var container = 'bindings';
    if ($val(shared, false)) container = 'shared';
    if (_.isArray(abstract)) {
      this.alias(abstract[0], abstract[1]);
      abstract = abstract[0];
    }
    this[container].set(abstract, concrete);
    return this;
  },

  /**
   * Sets binding alias
   * @param {string} abstract
   * @param {string} alias
   * @returns {Fiber.Container}
   */
  alias: function(abstract, alias) {
    this.aliases.set(alias, abstract);
    return this;
  },

  /**
   * Register a binding as shared instance (singleton)
   * @param {string} abstract
   * @param {Object} concrete
   * @returns {Fiber.Container}
   */
  share: function(abstract, concrete) {
    return this.bind(abstract, concrete, true);
  },

  /**
   * Register a binding as extension
   * @param {string} abstract
   * @param {Object} concrete
   * @returns {Fiber.Container}
   */
  extension: function(abstract, concrete) {
    this.extensions.set(abstract, concrete);
    return this;
  },

  /**
   * Retrieves type from the extensions and shared container
   * @param {string} abstract
   * @returns {*}
   */
  retrieve: function(abstract) {
    return this.extensions.get(abstract) || this.shared.get(abstract);
  },

  /**
   * Resolve the given type from the container.
   * @param {string|Array} abstract
   * @param {?Array} [parameters]
   * @param {?Object} [scope]
   * @returns {*}
   * @throws Resolution Exception
   */
  make: function(abstract, parameters, scope) {
    if (this.isAlias(abstract)) abstract = this.aliases.get(abstract);
    if (this.isRetrievable(abstract)) return this.retrieve(abstract);
    var concrete = this.bindings.get(abstract);
    if (! concrete || ! _.isFunction(concrete)) $Log.errorThrow('[Resolution Exception]: ' + abstract +
                                                                ', not a Class constructor or function.');
    if ($fn.class.is(concrete)) return this.instantiate(concrete, parameters);
    return concrete.apply($val(scope, this), this.resolve(parameters).concat([this]));
  },

  /**
   * Resolves and injects dependencies to the given function using arguments parsing
   * NOTE: This is not secure and safe way to use Dependency Injection. Variables can be minified and obfuscated.
   * @param {Function} fn
   * @returns {Function}
   */
  inject: function(fn) {
    if (! _.isFunction(fn)) $Log.errorThrow('Cannot inject dependencies, provided `fn` is not a Function');
    var depsKey = $Const.ioc.inject.deps
      , injectKey = $Const.ioc.inject.private;
    if (fn[depsKey]) return fn[depsKey];

    var resolved = []
      , strFn = fn.toString().replace($Const.ioc.regex.STRIP_COMMENTS, '')
      , args = strFn.match($Const.ioc.regex.ARGS);

    _.each(args[1].split($Const.ioc.regex.ARG_SPLIT), function(arg) {
      arg.replace($Const.ioc.regex.ARG, function(a, b, name) {
        if (_.isString(name) && _.startsWith(name, '$', 0)) name = name.slice(1, name.length);
        resolved.push(name);
      });
    });

    this.prepareForInject(fn);

    fn[depsKey] = resolved;
    fn[injectKey] = Fiber.make(resolved);

    return fn;
  },

  /**
   * Instantiates `concrete` type with resolved `parameters`
   * @param {Function} concrete
   * @param {Array} parameters
   * @returns {*|Object}
   */
  instantiate: function(concrete, parameters) {
    return $fn.class.createInstance(concrete, this.resolve(parameters));
  },

  /**
   * Resolves dependencies from container
   * @param {Array} dependencies
   * @returns {Array}
   */
  resolve: function(dependencies) {
    var resolved = [];
    dependencies = $fn.castArr(dependencies);
    for (var i = 0; i < dependencies.length; i ++) {
      var dep = dependencies[i];
      if (_.isString(dep) && this.bound(dep)) dep = this.make(dep);
      resolved.push(dep);
    }
    return resolved;
  },

  /**
   * Returns all dependencies from the container or from the bag retrieved by the `key`
   * @param {?string} [key]
   * @param {*} [defaults=[]]
   * @returns {Array}
   */
  all: function(key, defaults) {
    var bagAll = _.bind(function(bag) {
      return (this[bag] && this[bag].all()) || $val(defaults, []);
    }, this);

    if (key) return bagAll(key);
    return $fn.concat(this.bags.map(bagAll), false);
  },

  /**
   * Flushes Container
   * @return {Fiber.Container}
   */
  flush: function() {
    for (var i = 0; i < this.bags.length; i ++)
      this[this.bags[i]] = new Fiber.Bag();
    return this;
  },

  /**
   * Determine if type needs to be build
   * @param abstract
   * @returns {boolean}
   */
  isBuildable: function(abstract) {
    return ! this.isRetrievable(abstract);
  },

  /**
   * Determine if type needs to be retrieved
   * @param abstract
   * @returns {boolean}
   */
  isRetrievable: function(abstract) {
    return this.extensions.has(abstract) || this.shared.has(abstract);
  },

  /**
   * Determine if abstract is alias
   * @param {string} abstract
   * @returns {boolean}
   */
  isAlias: function(abstract) {
    return this.aliases.has(abstract);
  },


  /**
   * Prepares function for dependency injection
   * @param {Function} fn
   * @param {?string} [injectKey]
   * @param {?string} [depsKey]
   * @returns {Function}
   */
  prepareForInject: function(fn, injectKey, depsKey) {
    injectKey = $val(injectKey, $Const.ioc.inject.private, _.isString);
    depsKey = $val(depsKey, $Const.ioc.inject.deps, _.isString);

    fn.applyInjected = function(args) {
      if (! fn[injectKey]) return;
      var injectable = fn[injectKey].map(function(one) {
        return one instanceof Fiber.Extension ? one.getCodeCapsule() : one;
      });
      return fn.apply(fn, injectable.concat($fn.castArr(args)));
    };

    fn.getInjected = function() {
      return fn[injectKey];
    };

    fn.getInjectedDeps = function() {
      return fn[depsKey];
    };

    return fn;
  },
});

/**
 * Adds conditional methods to the Container
 */
$fn.class.createConditionMethods(Fiber.Container.prototype, ['bind', 'share', 'extension'], 'bound');

/**
 * Create default Fiber Inverse Of Control Container
 * @type {Object.<Fiber.Container>}
 */
Fiber.container = new Fiber.Container();

/**
 * Adds build in extensions to the Container
 */
Fiber.addExtension($fn.extensions.getRegistry());
