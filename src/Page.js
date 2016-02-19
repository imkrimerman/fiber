/**
 * Page
 * @type {Function}
 * @constructor
 */
Fiber.Page = Fiber.fn.class.make(Fiber.Class, [
  'NsEvents', 'Access', {

    /**
     * Is page bootstrapped
     * @type {boolean}
     */
    bootstrapped: false,

    /**
     * Class options to auto merge
     * @type {Object}
     */
    extendable: ['view', 'model', 'collection', 'load', 'bootstrap', 'options'],

    /**
     * Page instances
     * @type {Object}
     */
    instances: {
      view: null,
      model: null,
      collection: null,
    },

    /**
     * Events configuration object
     * @type {Object}
     */
    eventsNs: 'page',

    /**
     * Events catalog
     * @type {Object}
     */
    eventsCatalog: {
      bootstrap: 'bootstrap',
      bootstrapped: 'bootstrapped',
      load: 'load',
      loaded: 'loaded',
    },

    /**
     * Options
     * @type {Object}
     */
    options: {
      model: {},
      collection: [],
      view: {}
    },

    /**
     * Before bootstrap hook
     */
    beforeBootstrap: function() {},

    /**
     * After bootstrap hook
     */
    afterBootstrap: function() {},

    /**
     * Before load hook
     */
    beforeLoad: function() {},

    /**
     * After load hook
     */
    afterLoad: function() {},

    /**
     * Bootstraps Page
     * @param [{Array|undefined}] args
     * @returns {Page}
     */
    bootstrap: function(args) {
      this.instances = {};
      if (this.view && this.model && this.collection) this.instances.view = this.createView(args, _.assign({
        collection: (this.instances.collection = new this.collection(_.assign({ model: this.model }, this.options.collection)))
      }, this.options.view));
      else if (this.view && this.collection) this.instances.view = this.createView(args, _.assign({
        collection: (this.instances.collection = new this.collection(this.options.collection))
      }, this.options.view));
      else if (this.view && this.model) this.instances.view = this.createView(args, _.assign({
        model: (this.instances.model = new this.model(this.options.model))
      }, this.options.view));
      else if (this.view) this.instances.view = this.createView(args, this.options.view);
      return this;
    },

    /**
     * Loads page
     */
    load: function() {
      this.instances.view.render();
      return this.instances.view;
    },

    /**
     * Unloads page
     */
    unload: function() {
      this.instances.view.remove();
      this.instances.view = null;
      this.instances.collection = null;
      this.instances.model = null;
      this.instances = {};
    },

    /**
     * Creates view
     * @param [{Array}] args
     * @param [{Object}] options
     * @returns {Object}
     */
    createView: function(args, options) {
      var created = new this.view(_.assign({
        routeArgs: args || []
      }, options));
      return created;
    },

    /**
     * Returns view element
     * @returns {jQuery}
     */
    getElement: function() {
      return this.instances.view.$el;
    },

    /**
     * Before construct private hook
     * @private
     */
    __beforeConstruct: function() {
      this.bootstrap = _.wrap(this.bootstrap, function(bootstrap) {
        this.beforeBootstrap();
        this.fire('bootstrap', this);
        var returnObj = bootstrap.call(this);
        this.bootstrapped = true;
        this.afterBootstrap();
        this.fire('bootstrapped', this);
        return returnObj;
      });

      this.load = _.wrap(this.load, function(load) {
        this.beforeLoad();
        this.fire('load', this);
        var returnObj = load.call(this);
        this.afterLoad();
        this.fire('loaded', this);
        return returnObj;
      });
    },
  }
]);
