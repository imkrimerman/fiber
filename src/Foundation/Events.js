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
   * @type {Array|function(...)|string}
   */
  willExtend: ['eventsConfig'],

  /**
   * Responders holder
   * @type {Object}
   * @private
   */
  _responders: {},

  /**
   * Channels holder
   * @type {Object}
   * @private
   */
  _channels: {},

  /**
   * Returns event channel, if one is not exists with given `name`, it will be created
   * @param {string} name
   * @returns {Fiber.Events}
   */
  channel: function(name) {
    if ($fn.has(this._channels, name)) return $fn.get(this._channels, name);
    var channel = Fiber.Events.$new();
    $fn.set(this._channels, name, channel);
    return channel;
  },

  /**
   * Adds response as an action call for the given `event`
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [scope=this]
   * @returns {Fiber.Events}
   */
  respondTo: function(event, action, scope) {
    return $fn.set(this._responders, event, _.bind(action, $val(scope, this)));
  },

  /**
   * Sends event request and returns response
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  request: function(event) {
    if (! $fn.has(this._responders, event)) return void 0;
    var responder = $fn.get(this._responders, event);
    if (_.isFunction(responder)) return responder.apply(responder, _.drop(_.toArray(arguments)));
  },

  /**
   * Fires `event` with namespace (if available) and `catalog` alias look up
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  fire: function(event) {
    var args = _.drop(_.toArray(arguments));
    return this.trigger.apply(this, [this.event(event)].concat(args));
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
    var event = this._prepareEventName(event, listenable);
    return this.listenTo(listenable, event, _.bind(action, $val(scope, this)));
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
    return $fn.apply(Fiber.internal.events, 'trigger', arguments);
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
      Fiber.internal.events, event, _.bind(action, $val(scope, this))
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
      Fiber.internal.events, event, _.bind(action, $val(scope, this))
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
      Fiber.internal.events, event, _.bind(action, $val(scope, this))
    );
  },

  /**
   * Returns `event` with namespace and `catalog` look up.
   * @param {string} event
   * @returns {string}
   */
  event: function(event) {
    var eventName = $fn.get(this, $fn.join(['eventsConfig.catalog', event], '.')) || event;
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
    this._responders = {};
    this._channels = {};
    return this;
  },

  /**
   * Cleans up all events
   * @returns {Fiber.Events}
   */
  clearBoundEvents: function() {
    $fn.applyFn(Backbone.Events.destroyEvents, [], this);
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
    $each(this._channels, function(channel) {
      Fiber.Events.destroyEvents(channel);
    });
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
   * Prepares event name, handle ns event if listenable has event namespaces
   * @param {string} event
   * @param {Object} listenable
   * @returns {string}
   * @private
   */
  _prepareEventName: function(event, listenable) {
    listenable = $val(listenable, this);
    return $fn.has(listenable, 'event') ? listenable.event(event) : event;
  },

  /**
   * Makes single event string from array of events
   * @param {Array} events
   * @param {?string} [delimiter=':']
   * @returns {string}
   */
  joinEventName: function(events, delimiter) {
    delimiter = $val(delimiter, ':', _.isString);
    return $fn.compact(_.map($castArr(events), function(event) {
      return $fn.trim($fn.cast.toString(event), delimiter);
    })).join(delimiter);
  },
}, Backbone.Events);
