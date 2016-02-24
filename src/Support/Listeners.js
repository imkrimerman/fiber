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

  /**
   * Determine if event has listeners
   * @param {string} event
   * @returns {boolean}
   */
  hasEvent: function(event) {
    return ! ! this.filterByEvent(event).length;
  },

  /**
   * Returns listeners for provided `events`
   * @param {string} event
   * @returns {Array|Fiber.Model}
   */
  getByEvent: function(event) {
    var listeners = this.filterByEvent(event);
    if (listeners.length === 1) return listeners[0];
    return listeners;
  },

  /**
   * Filters collection by event
   * @param {string} event
   * @returns {Array}
   */
  filterByEvent: function(event) {
    return this.filter(function(listener) {
      return _.contains(listener.get('events'), event);
    });
  },

  /**
   * Returns listeners event handler
   * @param {string} event
   * @returns {Function|null}
   */
  getHandler: function(event) {
    var listener = this.getByEvent(event);
    if (_.isArray(listener))
      return _.pluck(listener, 'attributes.handler');
    return listener.get('handler');
  },

  /**
   * Invokes event handlers
   * @param {Object} scope
   * @param {string} event
   * @param {?Array} [args]
   */
  applyHandler: function(scope, event, args) {
    if (! this.listeners.hasEvent(event)) return;
    var handler = this.getHandler(event);
    if (_.isArray(handler)) _.each(handler, function(oneHandler) {
      this.callHandler(scope, oneHandler, args);
    }.bind(this));
    this.callHandler(scope, handler, args);
  },

  /**
   * Calls handler
   * @param {Object} scope
   * @param {string|Function} handler
   * @param {?Array} [args]
   * @returns {*}
   */
  callHandler: function(scope, handler, args) {
    if (_.isString(handler)) handler = scope[handler];
    if (_.isFunction(handler)) return handler.apply(scope, args);
  }
});
