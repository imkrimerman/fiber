/**
 * Monitor module
 * @class
 * @extends {$BaseClass}
 */
Fiber.Monitor = $BaseClass.create({

  /**
   * Monitoring options
   * @type {Object}
   */
  watches: {
    events: ['on', 'listenTo', 'off', 'stopListening', 'trigger'],
    sync: true,
  },

  /**
   * Notifier options
   * @type {Object}
   */
  notifier: {
    log: true,
    callback: null
  },

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['watches', '_monitor', '_monitoring', '_cache'],

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|Function|string|boolean}
   */
  willExtend: ['watches'],

  /**
   * Events monitor
   * @type {Fiber.Events}
   * @private
   */
  _monitor: Fiber.Events.instance(),

  /**
   * Monitoring state
   * @type {boolean}
   */
  _monitoring: false,

  /**
   * Cache object
   * @type {Object}
   */
  _cache: {},

  /**
   * Constructs Debug
   * @param {?Object} [options]
   */
  constructor: function(options) {
    $fn.class.handleOptions(this, options);
    $fn.class.ensureOwn(this, this.ownProps);
    $fn.class.extendFromOptions(this, options, this.willExtend);
    this.logger = new Fiber.Log({level: 'debug', template: false});
  },

  /**
   * Starts event monitoring on the `object`
   * @param {Object} object
   * @returns {Fiber.Monitor}
   */
  monitor: function(object) {
    this._monitor.listenTo(object, 'all', this._whenEvent.bind(this));
    return this;
  },

  /**
   * Starts monitoring
   * @return {Fiber.Monitor}
   */
  start: function() {
    if (this.isMonitoring()) return this;
    if (this.watches.sync) this.watch(Backbone, 'sync');
    if (this.watches.events) this.watch(Backbone.Events, this.watches.events);
    this._monitoring = true;
    return this;
  },

  /**
   * Stops monitoring, removes all event listeners and returns cached methods back to their owners.
   * @return {Fiber.Monitor}
   */
  stop: function() {
    this._monitoring = false;
    this._monitor.stopListening();
    for (var name in this._cache) {
      var orig = this._cache[name];
      if (orig.source) orig.source[name] = orig.fn;
    }
    return this;
  },

  /**
   * Notifies about intercepted case
   * @param {string} msg
   * @param {*} [args]
   * @returns {Fiber.Monitor}
   */
  notify: function(msg, args) {
    this.trigger.apply(this, ['notify'].concat($fn.cast.toArray(arguments)));
    if (this.notifier.log) this.logger.callWriter('debug', $fn.cast.toArray(args));
    else if (_.isFunction(this.notifier.callback)) $fn.applyFn(this.notifier.callback, arguments);
    return this;
  },

  /**
   * Creates watcher for the given method(s) of the source.
   * @param {Object} source
   * @param {string|Array.<string>} method
   */
  watch: function(source, method) {
    var self = this;
    $fn.multi(method, function(one) {
      var orig = self._cache[one] = {source: source, fn: source[one]};
      source[one] = function() {
        self.notify('Method [' + one + '] was called with arguments: ', arguments);
        $fn.applyFn(orig.fn, arguments, source);
      };
    });
  },

  /**
   * Determines if Monitor is watching
   * @returns {boolean}
   */
  isMonitoring: function() {
    return this._monitoring;
  },

  /**
   * Listens to event each triggered event
   * @param {string} event
   * @param {...args}
   * @private
   */
  _whenEvent: function(event) {
    this.notify('Event [' + event + '] was triggered with arguments: ', arguments);
  }
});
