/**
 * Fiber Listeners
 * @class
 * @extends {Fiber.BaseCollection}
 */
Fiber.Listeners = Fiber.BaseCollection.extend({

  /**
   * Events namespace
   * @var {string}
   */
  eventsNs: 'listeners',

  // Checks if event has listeners
  hasEvent: function(event) {
    return ! ! this.filterByEvent(event).length;
  },

  // Returns listeners for provided `events`
  getByEvent: function(event) {
    var listeners = this.filterByEvent(event);
    if (listeners.length === 1) return listeners[0];
    return listeners;
  },

  // Filters collection by event
  filterByEvent: function(event) {
    return this.filter(function(listener) {
      return _.contains(listener.get('events'), event);
    });
  },

  // Returns listener event handler
  getHandler: function(event) {
    var listener = this.getByEvent(event);
    if (_.isArray(listener))
      return _.pluck(listener, 'attributes.handler');
    return listener.get('handler');
  },

  // Invokes event handlers
  applyHandler: function(ctx, event, args) {
    if (! this.listeners.hasEvent(event)) return;
    var handler = this.getHandler(event);
    if (_.isArray(handler)) _.each(handler, function(oneHandler) {
      this.callHandler(ctx, oneHandler, args);
    }.bind(this));
    this.callHandler(ctx, handler, args);
  },

  // Calls handler
  callHandler: function(ctx, handler, args) {
    if (_.isString(handler)) handler = ctx[handler];
    if (_.isFunction(handler)) return handler.apply(ctx, args);
  }
});
