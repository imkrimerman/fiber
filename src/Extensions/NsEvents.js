// Namespace Events extension brings namespaces to the event and also
// provides catalog to simplify registered events.
Fiber.addExtension('NsEvents', {

  // Events namespace
  eventsNs: '',

  // Events catalog to hold the events
  eventsCatalog: {},

  // Fire `event` with namespace and `catalog` look up with given `payload`
  fire: function(event, payload) {
    return this.trigger(this.getNsEvent(event), payload);
  },

  // Every time namespaced `event` is fired invoke `action`. You can provide listenable
  // to control object to listen to.
  when: function(event, action, listenable) {
    return this.listenTo(val(listenable, this), this.getNsEvent(event), action);
  },

  // After first namespaced `event` is fired invoke `action` and remove action.
  // You can provide listenable to control object to listen to.
  after: function(event, action, listenable) {
    return this.listenToOnce(val(listenable, this), this.getNsEvent(event), action);
  },

  // Returns namespaced `event` with `catalog` look up.
  getNsEvent: function(event) {
    return this.eventsNs + ':' + this.getCatalogEvent(event);
  },

  // Returns event from catalog using alias. If not found will return `event` as is.
  getCatalogEvent: function(event) {
    return val(this.eventsCatalog[event], event);
  },

  // Sets `event` to the catalog by `alias`
  setCatalogEvent: function(alias, event) {
    this.eventsCatalog[alias] = event;
    return this;
  }
});
