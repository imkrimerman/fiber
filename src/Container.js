/**
 * Fiber Inverse Of Control Container
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Container = Fiber.Class.extend({

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
    Fiber.Class.apply(this, arguments);
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
   * @param {?string} [alias]
   * @returns {Fiber.Container}
   */
  share: function(abstract, concrete, alias) {
    var bound = this.bind(abstract, concrete, true);
    if ($val(alias, false)) this.alias(abstract, alias);
    return bound;
  },

  /**
   * Register a binding as extension
   * @param {string} abstract
   * @param {Object} concrete
   * @param {?string} [alias]
   * @returns {Fiber.Container}
   */
  extension: function(abstract, concrete, alias) {
    this.extensions.set(abstract, concrete);
    if ($val(alias, false)) this.alias(abstract, alias);
    return this;
  },

  /**
   * Retrieves type from the extensions and shared container
   * @param {string} abstract
   * @returns {*}
   */
  retrieve: function(abstract) {
    if (this.isAlias(abstract)) abstract = this.aliases.get(abstract);
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
    if ($fn.class.isClass(concrete)) return this.instantiate(concrete, parameters);
    return concrete.apply($val(scope, this), this.resolve(parameters).concat([this]));
  },

  /**
   * Instantiates `concrete` type with resolved `parameters`
   * @param {Function} concrete
   * @param {Array} parameters
   * @returns {*|Object}
   */
  instance: function(concrete, parameters) {
    return $fn.class.createInstance(concrete, this.resolve(parameters));
  },

  /**
   * Resolves and injects dependencies to the given function using arguments parsing
   * NOTE: This is not secure and safe way to use Dependency Injection. Variables can be minified and obfuscated.
   * @param {Function} fn
   * @returns {Function}
   */
  inject: function(fn) {
    if (! _.isFunction(fn)) $Log.errorThrow('Cannot inject dependencies, provided `fn` is not a Function');
    return $fn.injection.inject(fn);
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
  }
});

/**
 * Adds conditional methods to the Container
 */
$fn.class.createConditionMethods(Fiber.Container.prototype, ['bind', 'share', 'extension'], 'bound');

/**
 * Create default Fiber Inverse Of Control Container
 * @type {Object.<Fiber.Container>}
 */
$ioc = Fiber.container = new Fiber.Container();

_.extend(_.templateSettings.imports, {$ioc: $ioc});
_.extend($Const.template.imports, {$ioc: $ioc});
