// Namespace Events extension brings namespaces to the event and also
// provides catalog to simplify registered events.
Fiber.setExtension('NsEvents', {

  // Events namespace
  eventsNs: '',

  // Events catalog to hold the events
  eventsCatalog: {},

  // Fire `event` with namespace, `catalog` look up and given `payload`
  fire: function(event) {
    var args = _.drop(_.toArray(arguments));
    return this.trigger.apply(this, [this.nsEvent(event)].concat(args));
  },

  // Every time namespaced `event` is fired invoke `action`. You can provide listenable
  // to control object to listen to.
  when: function(event, action, listenable) {
    return this.listenTo(val(listenable, this), this.nsEvent(event), action);
  },

  // After first namespaced `event` is fired invoke `action` and remove action.
  // You can provide listenable to control object to listen to.
  after: function(event, action, listenable) {
    return this.listenToOnce(val(listenable, this), this.nsEvent(event), action);
  },

  // Sets events namespace
  setNs: function(eventsNs) {
    this.eventsNs = eventsNs;
    return this;
  },

  // Returns events namespace
  getNs: function() {
    return this.eventsNs;
  },

  // Checks if has valid (not empty) events namespace
  hasNs: function() {
    return ! _.isEmpty(this.eventsNs);
  },

  // Returns namespaced `event` with `catalog` look up.
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

  // Returns event from catalog using alias. If not found will return `event` as is.
  getCatalogEvent: function(event) {
    return val(this.eventsCatalog[event], event);
  },

  // Checks if event is catalog
  hasCatalogEvent: function(event) {
    return _.has(this.eventsCatalog, event);
  },

  // Sets `event` to the catalog by `alias`
  setCatalogEvent: function(alias, event) {
    this.eventsCatalog[alias] = event;
    return this;
  }
});
