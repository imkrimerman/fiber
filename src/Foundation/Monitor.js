/**
 * Monitor module
 * @class
 * @extends {BaseClass}
 */
Fiber.Monitor = BaseClass.extend({

  /**
   * Notify options
   * @type {Object}
   */
  notifies: {
    stackTrace: true,
  },

  /**
   * Symbols
   * @type {Object}
   */
  symbols: {
    method: '#',
    event: '@'
  },

  /**
   * Template to use to notify
   * @type {string}
   */
  template: '>> {{ symbol }} {{ type }} `{{ param }}` was {{ action }} with arguments:',

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|function(...)|string|boolean}
   */
  willExtend: ['notifies', 'symbols'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['notifies', '_monitor', '_cache', '_logger', 'templates', '_watchingGlobalEventsOn'],

  /**
   * Events monitor
   * @type {Fiber.Events}
   * @private
   */
  _monitor: null,

  /**
   * Cache object
   * @type {Array}
   * @private
   */
  _cache: [],

  /**
   * Logger instance
   * @type {Object.<Fiber.Log>}
   * @private
   */
  _logger: null,

  /**
   * Log templates
   * @type {Object}
   */
  _templates: {
    level: false,
    delimiter: false
  },

  /**
   * List of objects that are monitored for Global Events
   * @type {Array}
   */
  _watchingGlobalEventsOn: [],

  /**
   * Constructs Debug
   * @param {?Object} [options]
   */
  constructor: function(options) {
    this._monitor = Fiber.Events.$new();
    this._logger = new Fiber.Log({level: 'debug', as: '[Fiber.Monitor]', templates: this._templates});
    this._fired = $bind(this._fired, this);
    this._firedGlobal = $bind(this._firedGlobal, this);
    $fn.class.handleOptions(this, options);
    $fn.class.ensureOwn(this, this.ownProps);
    $fn.class.extendFromOptions(this, options, this.willExtend);
    this._listeningToGlobals(true);
  },

  /**
   * Watches and notifies about all events and methods triggered/called by the `object`.
   * @param {Object} object
   * @returns {Fiber.Monitor}
   */
  watch: function(object) {
    this.watchEvents(object);
    this.watchMethods(object);
    this.trigger('watch:start', object, this);
    return this;
  },

  /**
   * Stops watching and notifying about all events and methods triggered/called by the `object`.
   * @param object
   * @return {Fiber.Monitor}
   */
  stopWatching: function(object) {
    this.stopWatchingEvents(object);
    this.stopWatchingMethods(object);
    this.trigger('watch:stop', object, this);
    return this;
  },

  /**
   * Watches and notifies about all events triggered by the `object`.
   * @param {Object} object
   * @param {boolean} [watchGlobals=true]
   * @returns {Fiber.Monitor}
   */
  watchEvents: function(object, watchGlobals) {
    if (! $fn.isEventable(object)) $log.error('Cannot watch events. `Object` is not using `Backbone.Events`.');
    this._monitor.listenTo(object, 'all', this._fired);
    $val(watchGlobals, true) && this.watchGlobalEvents(object);
    this.trigger('watch.events:start', object, this);
    return this;
  },

  /**
   * Stops watching and notifying about all events triggered by the `object`.
   * @param {Object} object
   * @param {boolean} [stopGlobals=true]
   * @returns {Fiber.Monitor}
   */
  stopWatchingEvents: function(object, stopGlobals) {
    if (! $fn.isEventable(object)) $log.error('Cannot watch events. `Object` is not using `Backbone.Events`.');
    this._monitor.stopListening(object, 'all', this._fired);
    $val(stopGlobals, true) && this.stopWatchingGlobalEvents(object);
    this.trigger('watch.events:stop', object, this);
    return this;
  },

  /**
   * Watches and notifies about all global events triggered by the `object`.
   * @param {Object} object
   * @returns {Fiber.Monitor}
   */
  watchGlobalEvents: function(object) {
    var index = this._watchingGlobalEventsOn.indexOf(object);
    if (! (~ index)) this._watchingGlobalEventsOn.push(object);
    this.trigger('watch.events.global:start', object, this);
    return this;
  },

  /**
   * Stops watching and notifying about all global events triggered by the `object`.
   * @param {Object} object
   * @returns {Fiber.Monitor}
   */
  stopWatchingGlobalEvents: function(object) {
    var index = this._watchingGlobalEventsOn.indexOf(object);
    if (~ index) this._watchingGlobalEventsOn.splice(index, 0);
    this.trigger('watch.events.globals:stop', object, this);
    return this;
  },

  /**
   * Watches `object` `methods` calls
   * @param {Object} object
   * @param {string|Array.<string>} [methods]
   * @return {Fiber.Monitor}
   */
  watchMethods: function(object, methods) {
    if (_.isEmpty(methods)) methods = $fn.methods(object);
    this._releaseCached(object);
    var cached = this._createCached(object);
    cached.own = $fn.methods(object, false, true);
    for (var i = 0; i < methods.length; i ++) {
      var name = methods[i];
      cached.methods[name] = object[name];
      object[name] = (function(self, name, object) {
        return function() {
          self.notifyMethod(name, arguments, self._getStackTrace());
          return cached.methods[name].apply(object, arguments);
        };
      })(this, name, object);
    }

    this.trigger('watch.methods:start', object, this);
    return this;
  },

  /**
   * Stops watching `object` `methods` calls.
   * @param {Object} object
   * @param {string|Array.<string>} [methods]
   * @return {Fiber.Monitor}
   */
  stopWatchingMethods: function(object, methods) {
    var cached = this._findCached(object);
    if (! cached) return this;
    if (_.isEmpty(methods)) methods = _.keys(cached.methods);
    $each(methods, function(name) {
      if (! $has(cached.own, name)) delete object[name];
      else object[name] = cached.methods[name];
    });
    this._forgetCached(object);
    this.trigger('watch.methods:stop', object, this);
    return this;
  },

  /**
   * Notifies about event
   * @param {string} event
   * @param {Array|Arguments} args
   * @param {*} stack
   * @return {Fiber.Monitor}
   */
  notifyEvent: function(event, args, stack) {
    return this._notify('event', event, args, stack);
  },

  /**
   * Notifies about method call
   * @param {string} method
   * @param {Array|Arguments} args
   * @param {*} stack
   * @return {Fiber.Monitor}
   */
  notifyMethod: function(method, args, stack) {
    return this._notify('method', method, args, stack);
  },

  /**
   * Starts/Stops listening to Global Events.
   * @param {boolean} state
   * @private
   */
  _listeningToGlobals: function(state) {
    this._monitor[(state ? 'listenTo' : 'stopListening')](Fiber.internal.events, 'all', this._firedGlobal);
  },

  /**
   * Notifies that event was triggered.
   * @param {string} event
   * @param {...args}
   * @private
   */
  _fired: function(event, object) {
    this.notifyEvent(event, arguments, this._getStackTrace());
  },

  /**
   * Notifies that Global event was triggered.
   * @param {string} event
   * @param {...args}
   * @private
   */
  _firedGlobal: function(event, object) {
    for (var i = 0; i < this._watchingGlobalEventsOn.length; i ++) {
      if (this._watchingGlobalEventsOn[i].object === object) this._fired.apply(null, arguments);
    }
  },

  /**
   * Notifies about intercepted type action.
   * @param {string} type
   * @param {string} parameter
   * @param {Array|Arguments} args
   * @param {*} [stack]
   * @returns {Fiber.Monitor}
   * @private
   */
  _notify: function(type, parameter, args, stack) {
    type = type.toLowerCase();

    var msg = $fn.template.system(this.template, {
      symbol: this.symbols[type],
      type: type,
      action: type === 'event' ? 'triggered' : 'called',
      param: parameter
    });

    this._logger.log(msg, args, stack);
    this.trigger.apply(this, ['notify'].concat([msg, args, stack]));
    return this;
  },

  /**
   * Returns stack trace for the current call.
   * @returns {*|string}
   * @private
   */
  _getStackTrace: function() {
    if (this.notifies.stackTrace) try {var stack = (new Error).stack;}
    catch (e) {}
    return this._prepareStackTrace(stack) || '';
  },

  /**
   * Prepares stack trace.
   * @param {string} stackTrace
   * @returns {string}
   * @private
   */
  _prepareStackTrace: function(stackTrace) {
    var stack = (stackTrace || '').split("\n");
    if (stack.length > 2) {
      stack.shift();
      stack.shift();
    }
    return "\n" + stack.join("\n");
  },

  /**
   * Creates cached object structure and returns reference to it.
   * @param {Object} object
   * @returns {{object: {Object}, methods: {}}}
   * @private
   */
  _createCached: function(object) {
    var prepared = {object: object, methods: {}, own: []};
    this._cache.push(prepared);
    return prepared;
  },

  /**
   * Returns first found cached object using given `object`
   * @param {Object} object
   * @returns {Object|void}
   * @private
   */
  _findCached: function(object) {
    return _.first(_.filter(this._cache, function(cached) {
      if (cached.object === object) return cached;
    }));
  },

  /**
   * Removes object from the Monitor cache.
   * @param {Object} object
   * @returns {Fiber.Monitor}
   * @private
   */
  _forgetCached: function(object) {
    $each(this._cache, function(cached, index) {
      if (cached.object === object) this._cache.splice(+ index, 1);
    }, this);
    return this;
  },

  /**
   * Returns all watched methods to the owner object in original state.
   * @param {Object} object
   * @returns {Fiber.Monitor}
   * @private
   */
  _releaseCached: function(object) {
    if (this._findCached(object)) this.stopWatchingMethods(object);
    return this;
  }
});
