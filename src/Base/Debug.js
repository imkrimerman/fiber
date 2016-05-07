/**
 * Debug module
 * @class
 * @extends {Fiber.Log}
 */
Fiber.Debug = Fiber.Class.extend([
  $OwnProps, $Extend, {

    /**
     * Intercept options
     * @type {Object}
     */
    intercepts: {
      events: true,
      sync: true,
    },

    /**
     * List of instances to debug lifecycle
     * @type {Array}
     */
    watches: ['View', 'Model', 'Collection', 'Router'],

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|Function}
     */
    ownProps: ['intercepts', 'watches', '__monitor', '__originalMethods'],

    /**
     * Properties keys that will be auto extended from the initialization object
     * @type {Array|Function|string|boolean}
     */
    willExtend: ['intercepts', 'watches'],

    /**
     * Events monitor
     * @type {Fiber.Events}
     * @private
     */
    __monitor: Fiber.Events.instance(),

    /**
     * Cached original methods
     * @type {Object}
     */
    __originalMethods: {},

    /**
     * Events that will be intercepted
     * @type {Array}
     */
    __interceptEvents: ['on', 'listenTo', 'off', 'stopListening'],

    /**
     * Constructs Debug
     * @param {?Object} [options]
     */
    constructor: function(options) {
      $fn.class.handleOptions(this, options);
      this.logger = new Fiber.Log({level: 'debug', template: false});
      if (this.intercepts.sync) this.createInterceptor(Backbone, 'sync');
      if (this.intercepts.events) this.createInterceptor(Backbone.Events, this.__interceptEvents);
    },

    /**
     * Starts event monitoring on the `object`
     * @param {Object} object
     * @returns {Fiber.Debug}
     */
    monitor: function(object) {
      this.__monitor.listenTo(object, 'all', this.__whenEvent.bind(this));
      return this;
    },

    /**
     * Releases all events and returns cached methods back to their owners
     * @return {Fiber.Debug}
     */
    release: function() {
      this.__monitor.stopListening();
      for (var name in this.__originalMethods) {
        var orig = this.__originalMethods[name];
        if (orig.source) orig.source[name] = orig.fn;
      }
      return this;
    },

    /**
     * Logs arguments to the console
     * @param {string} msg
     * @param {*} [args]
     * @returns {Fiber.Debug}
     */
    log: function(msg, args) {
      this.logger.callWriter('debug', $fn.cast.toArray(args));
      return this;
    },

    /**
     * Creates interceptor function and caches original method.
     * @param {Object} source
     * @param {string|Array.<string>} fn
     */
    createInterceptor: function(source, fn) {
      var self = this;
      $fn.multi(fn, function(one) {
        var orig = self.__originalMethods[one] = {source: source, fn: source[one]};
        source[one] = function() {
          self.log('Method `' + one + '` called with arguments: ', arguments);
          $fn.applyFn(orig.fn, arguments, source);
        };
      });
    },

    /**
     * Listens to event each triggered event
     * @param {string} event
     * @param {...args}
     * @private
     */
    __whenEvent: function(event) {
      this.log('Event `' + event + '` was triggered with arguments: ', arguments);
    }
  }
]);
