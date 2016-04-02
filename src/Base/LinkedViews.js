/**
 * Fiber Linked Views
 * @class
 * @extends {BaseCollection}
 */
Fiber.LinkedViews = BaseCollection.extend({

  /**
   * Parent View
   * @type {Object.<Fiber.View>|null}
   */
  parentView: null,

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function}
   */
  extendable: ['parentView'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProp: ['parentView'],

  /**
   * Events namespace
   * @type {string}
   */
  eventsNs: 'linked',

  /**
   * Listen to views and propagate events
   * @type {boolean}
   */
  listenToViews: true,

  /**
   * Sets parent view
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.LinkedViews}
   */
  setParentView: function(view) {
    this.parentView = view;
    return this;
  },

  /**
   * Returns parent view
   * @returns {Object.<Fiber.View>|null}
   */
  getParentView: function() {
    return this.parentView;
  },

  /**
   * Removes and returns current parent view
   * @return {Object.<Fiber.View>|null}
   */
  forgetParentView: function() {
    var parentView = this.parentView;
    this.parentView = null;
    return parentView;
  },

  /**
   * Adds linked `view`
   * @param {Object.<Fiber.View>} view
   * @returns {Object.<Fiber.Model>}
   */
  addView: function(view) {
    var model = this.add({id: view.cid, view: view});
    this.startListeningToView(view);
    return model;
  },

  /**
   * Checks if is linked
   * @param {Object.<Fiber.View>} view
   * @returns {boolean}
   */
  hasView: function(view) {
    return ! _.isEmpty(this.get(view.cid));
  },

  /**
   * Removes linked `view`
   * @param {Object.<Fiber.View>} view
   * @returns {Object.<Fiber.View>}
   */
  forgetView: function(view) {
    this.remove(view.cid);
    this.stopListeningToView(view);
    return view;
  },

  /**
   * Resets linked views
   * @returns {Fiber.LinkedViews}
   */
  reset: function() {
    this.forgetParentView();
    this.stopListening();
    this.apply(Backbone.View, 'reset', arguments);
    return this;
  },

  /**
   * All events handler
   * @param {string} event
   * @param {Object.<Fiber.Model>} model
   * @param {Object} options
   */
  allEventsHandler: function(event, model, options) {
    this.fire(event, model, options);
  },

  /**
   * Starts listening to `view` events
   * @param {Object.<Fiber.View>} view
   * @param {?string} [event='all']
   * @returns {Fiber.LinkedViews}
   */
  startListeningToView: function(view, event) {
    event = val(event, 'all', _.isString);
    if (this.listenToViews) this.listenTo(view, event, this.allEventsHandler.bind(this));
    return this;
  },

  /**
   * Stops listening to `view` events
   * @param {Object.<Fiber.View>} view
   * @param {?string} [event='all']
   * @returns {Fiber.LinkedViews}
   */
  stopListeningToView: function(view, event) {
    event = val(event, 'all', _.isString);
    if (this.listenToViews) this.stopListening(view, event, this.allEventsHandler.bind(this));
    return this;
  }
});
