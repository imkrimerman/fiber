/**
 * Monitor module
 * @class
 * @extends {BaseClass}
 */
Fiber.Monitor = BaseClass.extend({

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
   * List of global Events methods
   * @type {Array}
   */
  _globalEventingMethods: ['fireGlobal', 'whenGlobal', 'afterGlobal', 'stopGlobal'],

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|function()|string|boolean}
   */
  willExtend: ['watches', 'notifies'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function()}
   */
  ownProps: ['watches', 'notifies', '_monitor', '_monitoring', '_cache', '_logger', '_globalEventingMethods'],

  /**
   * Constructs Debug
   * @param {?Object} [options]
   */
  constructor: function(options) {
    $fn.class.handleOptions(this, options);
    $fn.class.ensureOwn(this, this.ownProps);
    $fn.class.extendFromOptions(this, options, this.willExtend);
    this._logger = new Fiber.Log({level: 'debug', templatePrefix: '[Fiber.Monitor]', templateLevel: false});
    this._monitor = Fiber.Events.$new();
  },

  /**
   * Starts event monitoring on the `object`
   * @param {Object} object
   * @returns {Fiber.Monitor}
   */
  monitor: function(object) {
    this._monitor.listenTo(object, 'all', this.notifyEvent.bind(this));
    if ($fn.class.isImplementing(object, 'Events')) this.watch(object, this._globalEventingMethods, true);
    return this;
  },

  /**
   * Starts monitoring
   * @return {boolean}
   */
  start: function() {
    if (this.isMonitoring()) return false;
    if (this.watches.sync) this.watch(Backbone, 'sync');
    this._monitor.listenTo(Fiber.internal.events, 'all', this.notifyEvent.bind(this));
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
   * @param {?boolean} [isEvent=false]
   */
  watch: function(source, method, isEvent) {
    var self = this;
    $fn.multi(method, function(one) {
      var orig = self._cache[one] = {source: source, fn: source[one]};
      source[one] = function() {
        if (isEvent) self.notifyEvent.apply(self, arguments);
        else self.notifyMethod.apply(self, [one].concat(_.toArray(arguments)));
        $fn.applyFn(orig.fn, arguments, source);
      };
    });
  },

  /**
   * Notifies about event
   * @param {string} event
   * @param {...args}
   * @return {Fiber.Monitor}
   */
  notifyEvent: function(event) {
    return this.notify('event', event, arguments);
  },

  /**
   * Notifies about method call
   * @param {string} method
   * @param {...args}
   * @return {Fiber.Monitor}
   */
  notifyMethod: function(method) {
    return this.notify('method', method, arguments);
  },

  /**
   * Notifies about intercepted type action
   * @param {string} type
   * @param {string} parameter
   * @param {...args}
   * @returns {Fiber.Monitor}
   * @private
   */
  notify: function(type, parameter, args) {
    var action = type.toLowerCase() === 'event' ? 'triggered' : 'called'
    return this._notify(_.capitalize(type) + ' `' + parameter + '` was ' + action + ': ', _.drop(args));
  },

  /**
   * Determines if Monitor is watching
   * @returns {boolean}
   */
  isMonitoring: function() {
    return this._monitoring;
  },

  /**
   * Notifies about intercepted case
   * @param {string} msg
   * @param {*} [args]
   * @returns {Fiber.Monitor}
   * @private
   */
  _notify: function(msg, args) {
    var notifyArgs = $fn.cast.toArray(arguments);
    this.trigger.apply(this, ['notify'].concat(notifyArgs));
    if (this.notifies.log) this._logger.callWriter('debug', notifyArgs);
    else if (_.isFunction(this.notifies.callback)) $fn.applyFn(this.notifies.callback, notifyArgs);
    return this;
  },
});
