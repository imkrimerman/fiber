/**
 * Fiber Events
 *
 * Build in events brings namespaces to the event and also
 * provides catalog to simplify registered events and add ability to create event alias.
 *
 * @type {Object}
 */
Fiber.Events = _.extend({}, Backbone.Events, {

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
  ownProps: ['eventsConfig', '__responders'],

  /**
   * Responders holder
   * @type {Object}
   * @private
   */
  __responders: {},

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
    listenable = val(listenable, this);
    var event = this.prepareEventName(event, listenable);
    return this.listenTo(listenable, event, _.bind(action, val(scope, this)));
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
    listenable = val(listenable, this);
    var event = this.prepareEventName(event, listenable);
    return this.listenToOnce(listenable, event, _.bind(action, val(scope, this)));
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
    return Fiber.internal.events.on(event, _.bind(action, val(scope, this)));
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
    return Fiber.internal.events.once(event, _.bind(action, val(scope, this)));
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
    return Fiber.internal.events.off(event, _.bind(action, val(scope, this)));
  },

  /**
   * Adds response as an action call for the given `event`
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [scope=this]
   * @returns {Fiber.Events}
   */
  respondTo: function(event, action, scope) {
    return this.setResponder(event, action, scope);
  },

  /**
   * Sends event request and returns response
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  request: function(event) {
    if (! this.hasResponder(event)) return void 0;
    return this.callResponder(event, _.drop(_.toArray(arguments)));
  },

  /**
   * Returns responder for the given event or defaults otherwise
   * @param {string} event
   * @param {?*} [defaults]
   * @returns {*}
   */
  getResponder: function(event, defaults) {
    return this.get('__responders.' + event, defaults);
  },

  /**
   * Sets responder by `event`
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [scope=this]
   * @returns {Fiber.Events}
   */
  setResponder: function(event, action, scope) {
    return this.set('__responders.' + event, _.bind(action, val(scope, this)));
  },

  /**
   * Checks if responders contain action for the given `event`
   * @param {string} event
   * @returns {boolean}
   */
  hasResponder: function(event) {
    return this.has('__responders.' + event);
  },

  /**
   * Calls responder action with `args` for the given `event`
   * @param {string} event
   * @param {?Array|*} [args=[]]
   * @returns {*}
   */
  callResponder: function(event, args) {
    var responder = this.getResponder(event);
    if (! responder) return responder;
    return responder.apply(responder, val(args, [], _.isArray));
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
    // returns passed event as is if first char is `@`, used to support native backbone events
    if (event[0] === '@') return event.slice(1);
    // skip catalog look up by providing `!`
    else if (event[0] === '!') {
      event = event.slice(1);
      checkCatalog = false;
    }
    return ns + (checkCatalog ? this.getCatalogEvent(event) : event);
  },

  /**
   * Returns event from catalog using alias. If not found will return `event` as is.
   * @param {string} event
   * @returns {string|*}
   */
  getCatalogEvent: function(event) {
    return val(this.eventsConfig.catalog[event], event);
  },

  /**
   * Determine if event is catalog
   * @param {string} event
   * @returns {boolean}
   */
  hasCatalogEvent: function(event) {
    return _.has(this.eventsConfig.catalog, event);
  },

  /**
   * Sets `event` to the catalog by `alias`
   * @param {string} alias
   * @param {string} event
   * @returns {*}
   */
  setCatalogEvent: function(alias, event) {
    this.eventsConfig.catalog[alias] = event;
    return this;
  },

  /**
   * Prepares event name, handle ns event if listenable has event namespaces
   * @param {string} event
   * @param {Object} listenable
   * @returns {string}
   */
  prepareEventName: function(event, listenable) {
    listenable = val(listenable, this);
    return _.has(listenable, 'nsEvent') ? listenable.nsEvent(event) : event;
  },

  /**
   * Clones Events object instance
   * @returns {Fiber.Events}
   */
  instance: function() {
    return _.extend({}, this);
  },

  /**
   * Includes current Events to the given `object`
   * @param {Object} object
   * @returns {Object}
   */
  includeTo: function(object) {
    return Fiber.fn.class.mix(object, this.instance());
  },
});
