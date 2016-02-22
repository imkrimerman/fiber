/**
 * Fiber Inverse Of Control Container
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Container = Fiber.fn.class.make(Fiber.Class, [
  'Extend', 'OwnProperties', {

    /**
     * The container's bindings.
     * @var {Object.<Fiber.Bag>}
     */
    bindings: null,

    /**
     * Bag of extensions
     * @var {Object.<Fiber.Bag>}
     */
    extensions: null,

    /**
     * Bag of shared instances
     * @var {Object.<Fiber.Bag>}
     */
    shared: null,

    /**
     * Bags list
     * @var {Array}
     */
    bags: ['bindings', 'extensions', 'shared'],

    /**
     * Initializes Container
     */
    initialize: function(options) {
      this.applyOwnProps();
      this.applyExtend(options);
      this.flush();
    },

    /**
     * Determine if the given abstract type has been bound.
     * @param {string} abstract
     * @returns {boolean}
     */
    bound: function(abstract) {
      return _.any(this.bags, _.bind(function(bag) {
        return this[bag].has(abstract);
      }, this));
    },

    /**
     * Register a binding with the container.
     * @param {string} abstract
     * @param {*} concrete
     * @param {boolean} shared
     * @returns {Fiber.Container}
     */
    bind: function(abstract, concrete, shared) {
      var container = 'bindings';
      if (val(shared, false)) container = 'shared';
      this[container].set(abstract, concrete);
      return this;
    },

    /**
     * Register a binding if it hasn't already been registered.
     * @param {string} abstract
     * @param {*} concrete
     * @param {boolean} shared
     * @returns {Fiber.Container}
     */
    bindIf: function(abstract, concrete, shared) {
      if (! this.bound(abstract)) this.bind(abstract, concrete, shared);
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
      if (this.isRetrievable(abstract)) return this.retrieve(abstract);
      var concrete = this.bindings.get(abstract);
      if (! concrete) throw new Error('Resolution Exception with ' + abstract);
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
      for (var i = 0; i < dependencies.length; i++) {
        var dep = dependencies[i];
        if (_.isString(dep)) {
          var retrieved = this.make(dep);
          if (retrieved) dep = retrieved;
        }
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

  }
]);

