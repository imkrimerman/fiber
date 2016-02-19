// Fiber Linked Views Collection
Fiber.LinkedViews = Fiber.Collection.extend({

  // Parent View
  parentView: null,

  // Properties keys that will be auto extended from initialize object
  extendable: ['parentView'],

  // Properties keys that will be owned by the instance
  ownProp: ['parentView'],

  // Events namespace
  eventsNs: 'linked',

  // Listen to views and propagate events
  listenViews: true,

  // Adds `view` to child views
  addView: function(view) {
    var model = this.add({id: view.cid, view: view});
    if (this.listenViews)
      this.when('all', this.allEventsHandler.bind(this), model.get('view'));
    return model;
  },

  // Removes `view` from child views
  removeView: function(view) {
    var removed = this.remove(view.cid);
    if (this.listenViews) this.stopListening(removed.get('view'));
  },

  // Checks if child views has given `view`
  hasView: function(view) {
    return ! _.isEmpty(this.get(view.cid));
  },

  // Resets linked views
  reset: function() {
    this.parentView = null;
    this.stopListening();
    this.fn.apply(Backbone.View, 'reset', arguments);
  },

  // All event handler
  allEventsHandler: function(event, model, options) {
    this.fire(event, model, options);
  }
});
