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
    catalog: {},

    /**
     * Events fire configuration.
     * @type {Object}
     */
    fire: {

      /**
       * Flag to determine if method that is computed from event name will be called on object.
       * @type {boolean}
       */
      callEventMethod: true,

      /**
       * Prefix to use in events transformation to method name.
       * @type {string}
       */
      methodPrefix: 'when',

      /**
       * Flag to determine if events will be fired with lifecycle.
       * @type {boolean}
       */
      cyclic: false,

      /**
       * List of full event lifecycle.
       * @type {Array}
       */
      lifeCycle: ['before', '@callback', 'after']
    }
  },

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|function(...)|string}
   */
  willExtend: ['eventsConfig'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['eventsConfig'],

  /**
   * Registered channels holder
   * @type {Object}
   * @private
   */
  _eventChannels: {},

  /**
   * Registered request holder
   * @type {Object}
   * @private
   */
  _eventRequests: {},

  /**
   * Returns event channel, if one is not exists with given `name`, it will be created
   * @param {string} name
   * @returns {Fiber.Events}
   */
  channel: function(name) {
    if ($has(this._eventChannels, name)) return $get(this._eventChannels, name);
    var channel = Fiber.Events.$new();
    $set(this._eventChannels, name, channel);
    return channel;
  },

  /**
   * Adds response as an action call for the given `event`
   * @param {string} event
   * @param {function(...)} withAction
   * @param {?Object} [scope=this]
   * @returns {Fiber.Events}
   */
  respondTo: function(event, withAction, scope) {
    $set(this._eventRequests, event, $bind(withAction, $val(scope, this)));
    return this;
  },

  /**
   * Sends event request and returns response
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  request: function(event) {
    var response = $get(this._eventRequests, event);
    if ($isFn(response)) return response.apply(response, $drop(arguments));
    $log.warn('Response for the requested `event` [' + event + '] is not registered.')
    return void 0;
  },

  /**
   * Emits `event` with namespace (if available) and `catalog` alias look up.
   * @param event
   * @returns {Fiber.Events}
   */
  emit: function(event) {
    this.trigger.apply(this, [this.event(event)].concat($drop(arguments)));
    return this;
  },

  /**
   * Fires `event` with namespace (if available) and `catalog` alias look up.
   * If `eventsConfig.callEventMethod` is `true` then `fireCall` method will be triggered with current arguments.
   * If `eventsConfig.cyclic` is `true` then `fireCallCyclic` method will be triggered with current arguments.
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  fire: function(event) {
    if (this.eventsConfig.fire.cyclic) {
      if (! $isFn(arguments[1])) arguments[1] = $noop;
      return this.fireCallCyclic.apply(this, arguments);
    }

    if (this.eventsConfig.fire.callEventMethod) return this.fireCall.apply(this, arguments);
    this.emit.apply(this, arguments);
    return this;
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires `event`.
   * @param {string} event - event to fire and transform to callback name
   * @param {...args}
   * @returns {Object}
   */
  fireCall: function(event) {
    var args = $drop(arguments), options = $fn.merge(this.eventsConfig.fire, {fireMethod: 'trigger'});
    return $fn.fireCall(this, event, {fire: args, call: args}, options);
  },

  /**
   * Fires lifecycle `event` by calling `fireCall` on each lifecycle part.
   * If current lifecycle includes `@callback` then given callback will be called on time.
   * @param {string} event - event to fire and transform to callback name
   * @param {function(...)} callback
   * @param {...args}
   * @return {Object}
   */
  fireCallCyclic: function(event, callback) {
    var args = $drop(arguments, 2), options = $fn.merge(this.eventsConfig.fire, {fireMethod: 'trigger'});
    return $fn.fireCallCyclic(this, event, {fire: args, call: args, callback: args}, options);
  },

  /**
   * Every time `event` is fired invokes `action`.
   * You can provide listenable to listen to as last argument.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [listenable=this]
   * @param {?Object} [scope=this]
   */
  when: function(event, action, listenable, scope) {
    listenable = $val(listenable, this);
    return this.listenTo(listenable, this._handleEventName(event, listenable), $bind(action, $val(scope, this)));
  },

  /**
   * After first `event` is fired invoke `action` and remove it.
   * You can provide listenable to listen to as last argument.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [listenable=this]
   * @param {?Object} [scope=this]
   */
  after: function(event, action, listenable, scope) {
    listenable = $val(listenable, this);
    return this.listenToOnce(listenable, this._handleEventName(event, listenable), $bind(action, $val(scope, this)));
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
    return $fn.apply(Fiber.internal.events, 'trigger', $fn.argsConcat(this.event(event), arguments));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  whenGlobal: function(event, action, scope) {
    return Fiber.internal.events.listenTo(
      Fiber.internal.events, this.event(event), $bind(action, $val(scope, this))
    );
  },

  /**
   * Adds global event `action` for the `event` with the given `scope` and remove after first trigger.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  afterGlobal: function(event, action, scope) {
    return Fiber.internal.events.listenToOnce(
      Fiber.internal.events, event, $bind(action, $val(scope, this))
    );
  },

  /**
   * Stop listening global `event` with `action`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  stopGlobal: function(event, action, scope) {
    return Fiber.internal.events.stopListening(
      Fiber.internal.events, event, $bind(action, $val(scope, this))
    );
  },

  /**
   * Returns `event` with namespace and `catalog` look up.
   * @param {string} event
   * @returns {string}
   */
  event: function(event) {
    var eventName = $get(this, $fn.join(['eventsConfig.catalog', event], '.')) || event;
    // returns passed event as is if first char is `!`
    if (event[0] === '!') return event.slice(1);
    // skip catalog look up by providing `@`
    else if (event[0] === '@') eventName = event.slice(1);
    // and lastly join namespace and event string
    return this.joinEventName([this.eventsConfig.ns, eventName]);
  },

  /**
   * Initializes events properties
   * @return {Fiber.Events}
   */
  resetEventProperties: function() {
    this._eventRequests = {};
    this._eventChannels = {};
    return this;
  },

  /**
   * Cleans up all events
   * @returns {Fiber.Events}
   */
  clearBoundEvents: function() {
    Backbone.Events.destroyEvents.call(this);
    return this;
  },

  /**
   * Stops listening to all events and channels.
   * @param {Backbone.Events|Fiber.Events} [events]
   * @return {Backbone.Events|Fiber.Events}
   */
  destroyEvents: function(events) {
    events = $val(events, this);
    events.clearBoundEvents();
    events.clearChannels();
    events.resetEventProperties();
    return events;
  },

  /**
   * Destroys and removes all channels
   * @returns {Fiber.Events}
   */
  clearChannels: function() {
    $each(this._eventChannels, Fiber.Events.destroyEvents);
    return this;
  },

  /**
   * Returns new Events object
   * @returns {Fiber.Events}
   */
  $new: function() {
    return $fn.clone(Fiber.Events, true);
  },

  /**
   * Returns new copy of Events object mixed with the given `mixin`
   * @param {Object} mixin
   * @returns {Fiber.Events}
   */
  $mix: function(mixin) {
    return $fn.class.include(this.$new(), mixin, true);
  },

  /**
   * Makes single event string from array of events
   * @param {Array} events
   * @param {?string} [delimiter=':']
   * @returns {string}
   */
  joinEventName: function(events, delimiter) {
    delimiter = $val(delimiter, ':', $isStr);
    return $fn.compact(_.map($castArr(events), function(event) {
      if (! $isStr(event)) return;
      return $fn.trim(event, delimiter);
    })).join(delimiter);
  },

  /**
   * Handles `event` by trying to retrieve it from listenable.
   * @param {string} event
   * @param {Object} listenable
   * @returns {string}
   * @private
   */
  _handleEventName: function(event, listenable) {
    listenable = $val(listenable, this);
    return $isFn(listenable.event) ? listenable.event(event) : event;
  },
}, Backbone.Events);
