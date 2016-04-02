/**
 * Fiber Inverse Of Control Container
 * @class
 */
Fiber.Container = Fiber.fn.class.create({

  /**
   * The container's bindings.
   * @type {Object.<Fiber.Bag>}
   */
  bindings: null,

  /**
   * Bag of extensions
   * @type {Object.<Fiber.Bag>}
   */
  extensions: null,

  /**
   * Bag of shared instances
   * @type {Object.<Fiber.Bag>}
   */
  shared: null,

  /**
   * Bag of aliases
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
    Fiber.fn.apply(this, 'initialize', [arguments]);
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
    if (val(shared, false)) container = 'shared';
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
   * @param abstract
   * @param parameters
   * @param scope
   * @returns {*}
   * @throws Resolution Exception
   */
  make: function(abstract, parameters, scope) {
    if (this.isAlias(abstract)) abstract = this.aliases.get(abstract);
    if (this.isRetrievable(abstract)) return this.retrieve(abstract);
    var concrete = this.bindings.get(abstract);
    if (! concrete) Fiber.logs.system.errorThrow('Resolution Exception with ' + abstract);
    return concrete.apply(val(scope, this), this.resolve(parameters).concat([this]));
  },

  /**
   * Resolves dependencies from container
   * @param {Array} dependencies
   * @returns {Array}
   */
  resolve: function(dependencies) {
    var resolved = [];
    dependencies = _.castArray(dependencies);
    for (var i = 0; i < dependencies.length; i ++) {
      var dep = dependencies[i];
      if (_.isString(dep) && this.bound(dep)) dep = this.make(dep);
      resolved.push(dep);
    }
    return resolved;
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

});

/**
 * Adds conditional methods to the Container
 */
Fiber.fn.class.createConditionMethods(Fiber.Container.prototype, ['bind', 'share', 'extension'], 'bound');

/**
 * Create default Fiber Inverse Of Control Container
 * @type {Object.<Fiber.Container>}
 */
Fiber.container = new Fiber.Container();

/**
 * Adds default extensions to the Container
 */
Fiber.addExtension({
  Access: $Access,
  Binder: $Binder,
  Extend: $Extend,
  Mixin: $Extensions,
  OwnProps: $OwnProps
});
