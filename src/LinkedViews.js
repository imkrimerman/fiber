// Fiber Linked Views Collection
Fiber.LinkedViews = Fiber.make(Fiber.Collection, {

  // Parent View
  parentView: null,

  // Properties keys that will be auto extended from initialize object
  extendable: ['parentView'],

  // Properties keys that will be owned by the instance
  ownProp: ['parentView'],

  // Events namespace
  eventsNs: 'childViews',

  // Adds `view` to child views
  addView: function(view) {
    return this.add({id: view.cid, view: view});
  },

  // Removes `view` from child views
  removeView: function(view) {
    return this.remove(view.cid);
  },

  // Checks if child views has given `view`
  hasView: function(view) {
    return ! _.isEmpty(this.get(view.cid));
  }
});
