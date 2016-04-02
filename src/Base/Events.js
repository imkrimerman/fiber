/**
 * Fiber Events
 *
 * Build in events brings namespaces to the event and also
 * provides catalog to simplify registered events for the developers.
 * @class
 */
Fiber.Events = Fiber.fn.class.createClass({

  /**
   * Events namespace
   * @var {string}
   */
  eventsNs: '',

  /**
   * Events catalog to hold the events
   * @var {Object}
   */
  eventsCatalog: {},

  /**
   * Fire `event` with namespace, `catalog` look up and given `payload`
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  fire: function(event) {
    var args = _.drop(_.toArray(arguments));
    return this.trigger.apply(this, [this.nsEvent(event)].concat(args));
  },

  /**
   * Every time namespaced `event` is fired invoke `action`. You can provide listenable
   * to control object to listen to.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [listenable=this]
   */
  when: function(event, action, listenable) {
    return this.listenTo(val(listenable, this), this.nsEvent(event), action);
  },

  /**
   * After first namespaced `event` is fired invoke `action` and remove action.
   * You can provide listenable to control object to listen to.
   * @param {string} event
   * @param {Function} action
   * @param {?Object} [listenable=this]
   */
  after: function(event, action, listenable) {
    return this.listenToOnce(val(listenable, this), this.nsEvent(event), action);
  },

  /**
   * Sets events namespace
   * @param {string} eventsNs
   * @returns {*}
   */
  setNs: function(eventsNs) {
    this.eventsNs = eventsNs;
    return this;
  },

  /**
   * Returns events namespace
   * @returns {string}
   */
  getNs: function() {
    return this.eventsNs;
  },

  /**
   * Determine if has valid (not empty) events namespace
   * @returns {boolean}
   */
  hasNs: function() {
    return ! _.isEmpty(this.eventsNs);
  },

  /**
   * Returns namespaced `event` with `catalog` look up.
   * @param {string} event
   * @returns {string}
   */
  nsEvent: function(event) {
    var checkCatalog = true
      , ns = this.eventsNs ? this.eventsNs + ':' : '';
    // return passed event as is if first char is `@`, used to support native backbone events
    if (event[0] === '@') return event.slice(1);
    // remove `!` if first char is `!`
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
    return val(this.eventsCatalog[event], event);
  },

  /**
   * Determine if event is catalog
   * @param {string} event
   * @returns {boolean}
   */
  hasCatalogEvent: function(event) {
    return _.has(this.eventsCatalog, event);
  },

  /**
   * Sets `event` to the catalog by `alias`
   * @param {string} alias
   * @param {string} event
   * @returns {*}
   */
  setCatalogEvent: function(alias, event) {
    this.eventsCatalog[alias] = event;
    return this;
  }
});
