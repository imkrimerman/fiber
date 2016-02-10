// Namespace Events extension brings namespaces to the event and also
// provides catalog to simplify registered events.
Fiber.addExtension('NsEvents', {

  // Events namespace
  eventsNs: '',

  // Events catalog to hold the events
  eventsCatalog: {},

  // Fire `event` with namespace, `catalog` look up and given `payload`
  fire: function(event) {
    return this.trigger.apply(this, [this.getNsEvent(event)].concat(_.drop(_.toArray(arguments))));
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
    if (event[0] === '@') return event.slice(1);
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
