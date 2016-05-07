/**
 * Monitor module
 * @class
 * @extends {$BaseClass}
 */
Fiber.Monitor = $BaseClass.extend({

  /**
   * Monitoring options
   * @type {Object}
   */
  watches: {
    events: ['on', 'listenTo', 'off', 'stopListening', 'trigger'],
    sync: true,
  },

  /**
   * Notify options
   * @type {Object}
   */
  notifies: {
    log: true,
    callback: null
  },

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['watches', 'notifies', '_monitor', '_monitoring', '_cache', '_logger'],

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|Function|string|boolean}
   */
  willExtend: ['watches', 'notifies'],

  /**
   * Events monitor
   * @type {Fiber.Events}
   * @private
   */
  _monitor: null,

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
   * Logger instance
   * @type {Object.<Fiber.Log>}
   */
  _logger: null,

  /**
   * Constructs Debug
   * @param {?Object} [options]
   */
  constructor: function(options) {
    $fn.class.handleOptions(this, options);
    $fn.class.ensureOwn(this, this.ownProps);
    $fn.class.extendFromOptions(this, options, this.willExtend);
    this._logger = new Fiber.Log({level: 'debug', template: false});
    this._monitor = Fiber.Events.$new();
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
   * @return {boolean}
   */
  start: function() {
    if (this.isMonitoring()) return false;
    if (this.watches.sync) this.watch(Backbone, 'sync');
    if (this.watches.events) this.watch(Backbone.Events, this.watches.events);
    return this._monitoring = true;
  },

  /**
   * Stops monitoring, removes all event listeners and returns cached methods back to their owners.
   * @return {boolean}
   */
  stop: function() {
    if (! this.isMonitoring()) return false;
    this._monitor.stopListening();
    for (var name in this._cache) {
      var orig = this._cache[name];
      if (orig.source) orig.source[name] = orig.fn;
    }
    this._monitoring = false;
    return true;
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
   * Notifies about intercepted case
   * @param {string} msg
   * @param {*} [args]
   * @returns {Fiber.Monitor}
   */
  notify: function(msg, args) {
    this.trigger.apply(this, ['notify'].concat($fn.cast.toArray(arguments)));
    if (this.notifies.log) this._logger.callWriter('debug', $fn.cast.toArray(args));
    else if (_.isFunction(this.notifies.callback)) $fn.applyFn(this.notifies.callback, arguments);
    return this;
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
