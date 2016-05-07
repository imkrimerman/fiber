/**
 * Fiber Events
 *
 * Build in events brings namespaces to the event and also
 * provides catalog to simplify registered events and add ability to create event alias.
 *
 * @type {Object}
 */
Fiber.Events = _.extend({

  /**
   * Events configuration
   * @type {Object}
   */
  eventsConfig: {

    /**
     * Events namespace
     * @type {string}
     */
    ns: '',

    /**
     * Events catalog to hold the events
     * @type {Object}
     */
    catalog: {}
  },

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function|string}
   */
  willExtend: ['eventsConfig'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['eventsConfig', '_responders'],

  /**
   * Responders holder
   * @type {Object}
   * @private
   */
  _responders: {},

  /**
   * Fires `event` with namespace (if available) and `catalog` alias look up
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  fire: function(event) {
    var args = _.drop(_.toArray(arguments));
    return this.trigger.apply(this, [this.nsEvent(event)].concat(args));
  },

  /**
   * Every time `event` is fired invokes `action`.
   * You can provide listenable to listen to as last argument.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [listenable=this]
   * @param {?Object} [scope=this]
   */
  when: function(event, action, listenable, scope) {
    listenable = $val(listenable, this);
    var event = this._prepareEventName(event, listenable);
    return this.listenTo(listenable, event, _.bind(action, $val(scope, this)));
  },

  /**
   * After first `event` is fired invoke `action` and remove it.
   * You can provide listenable to listen to as last argument.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [listenable=this]
   * @param {?Object} [scope=this]
   */
  after: function(event, action, listenable, scope) {
    listenable = $val(listenable, this);
    var event = this._prepareEventName(event, listenable);
    return this.listenToOnce(listenable, event, _.bind(action, $val(scope, this)));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  fireGlobal: function(event) {
    return $trigger.apply(Fiber.internal.events, [event].concat($fn.cast.toArray(_.drop(arguments))));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  whenGlobal: function(event, action, scope) {
    return Fiber.internal.events.on(event, _.bind(action, $val(scope, this)));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope` and remove after first trigger.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  afterGlobal: function(event, action, scope) {
    return Fiber.internal.events.once(event, _.bind(action, $val(scope, this)));
  },

  /**
   * Stop listening global `event` with `action`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  stopGlobal: function(event, action, scope) {
    return Fiber.internal.events.off(event, _.bind(action, $val(scope, this)));
  },

  /**
   * Adds response as an action call for the given `event`
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [scope=this]
   * @returns {Fiber.Events}
   */
  respondTo: function(event, action, scope) {
    return this.set($fn.join('_responders', event, '.'), _.bind(action, $val(scope, this)))
  },

  /**
   * Sends event request and returns response
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  request: function(event) {
    if (! this.has($fn.join('_responders', event, '.'))) return void 0;
    return this.callResponder(event, _.drop(_.toArray(arguments)));
  },

  /**
   * Calls responder action with `args` for the given `event`
   * @param {string} event
   * @param {?Array|*} [args=[]]
   * @returns {*}
   */
  callResponder: function(event, args) {
    var responder = this.get($fn.join('_responders', event, '.'));
    args = $val(args, []);
    if (! _.isArray(args) && ! _.isArguments(args)) args = $fn.castArr(args);
    if (! responder) return responder;
    return responder.apply(responder, args);
  },

  /**
   * Sets events namespace
   * @param {string} ns
   * @returns {*}
   */
  setNs: function(ns) {
    this.eventsConfig.ns = ns;
    return this;
  },

  /**
   * Returns events namespace
   * @returns {string}
   */
  getNs: function() {
    return this.eventsConfig.ns;
  },

  /**
   * Determine if has valid (not empty) events namespace
   * @returns {boolean}
   */
  hasNs: function() {
    return ! _.isEmpty(this.eventsConfig.ns);
  },

  /**
   * Returns namespaced `event` with `catalog` look up.
   * @param {string} event
   * @returns {string}
   */
  nsEvent: function(event) {
    var checkCatalog = true
      , ns = ! _.isEmpty(this.eventsConfig.ns) ? this.eventsConfig.ns + ':' : '';
    // returns passed event as is if first char is `@`
    if (event[0] === '@') return event.slice(1);
    // skip catalog look up by providing `!`
    else if (event[0] === '!') {
      event = event.slice(1);
      checkCatalog = false;
    }
    return ns + (checkCatalog ? this.$getEvent(event) : event);
  },

  /**
   * Returns event from catalog using alias. If not found will return `event` as is.
   * @param {string} event
   * @returns {string|*}
   */
  $getEvent: function(event) {
    return $val(this.eventsConfig.catalog[event], event);
  },

  /**
   * Determine if event is catalog
   * @param {string} event
   * @returns {boolean}
   */
  $hasEvent: function(event) {
    return $fn.has(this.eventsConfig.catalog, event);
  },

  /**
   * Sets `event` to the catalog by `alias`
   * @param {string} alias
   * @param {string} event
   * @returns {*}
   */
  $setEvent: function(alias, event) {
    this.eventsConfig.catalog[alias] = event;
    return this;
  },

  /**
   * Clones Events object instance
   * @returns {Fiber.Events}
   */
  $new: function() {
    return _.extend({}, this);
  },

  /**
   * Prepares event name, handle ns event if listenable has event namespaces
   * @param {string} event
   * @param {Object} listenable
   * @returns {string}
   */
  _prepareEventName: function(event, listenable) {
    listenable = $val(listenable, this);
    return _.has(listenable, 'nsEvent') ? listenable.nsEvent(event) : event;
  }
}, Backbone.Events);
