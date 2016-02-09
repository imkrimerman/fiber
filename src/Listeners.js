// Fiber Listeners Collection
Fiber.Listeners = Fiber.Collection.extend({

  // Checks if event has listeners
  hasEvent: function(event) {
    return !! this.filterByEvent(event).length;
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
  getEventHandler: function(event) {
    var listener = this.getByEvent(event);
    if (_.isArray(listener))
      return _.pluck(listener, 'attributes.handler');
    return listener.get('handler');
  }
});
