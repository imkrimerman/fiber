/**
 * Views Manager
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Views = Fiber.Class.extend({

  /**
   * Linked Views Collection
   * @type {Object.<Fiber.LinkedViews>}
   */
  _linked: null,

  /**
   * Bag of shown Views
   * @type {Object.<Fiber.Bag>}
   */
  _shown: null,

  /**
   * Constructs manager
   * @param {jQuery|string} $el
   * @param {Object} [viewMap]
   */
  constructor: function($el, viewMap) {
    this._linked = new Fiber.LinkedViews();
    this._shown = new Fiber.Bag();
    if ($isPlain(viewMap)) this._shown.reset(viewMap);
    this.handleRootElement($el);
  },

  /**
   * Shows view at the given selector
   * @param {string} selector
   * @param {Object.<Fiber.View>} [view]
   * @return {Fiber.Views}
   */
  show: function(selector, view) {
    if (arguments.length === 1) view = this._shown.get(selector);
    else this._shown.set(selector, view);
    return this.renderTo(selector, view);
  },

  /**
   * Refreshes view at the `selector`
   * @param {string} selector
   * @returns {Fiber.Views}
   */
  refresh: function(selector) {
    this.close(selector);
    this.show(selector);
    return this;
  },

  /**
   * Closes view at the `selector`
   * @param {string} selector
   * @returns {Fiber.Views}
   */
  close: function(selector) {
    if (! this._shown.has(selector)) return this;
    this.cleanUp(selector);
    return this;
  },

  /**
   * Cleans shown view by the selector
   * @param {string} selector
   * @param {boolean} [cleanUp=true]
   * @returns {Fiber.Views}
   */
  cleanUp: function(selector, cleanUp) {
    var shown = this._shown.get(selector);
    if (! shown) return this;
    this._linked.forgetView(shown);
    this._shown.forget(selector);
    if ($val(cleanUp, true, _.isBoolean)) shown.remove();
    return this;
  },

  /**
   * Renders `view` to the found element by the `selector`
   * @param {string} selector
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.Views}
   */
  renderTo: function(selector, view) {
    this._renderToDestination(selector, view);
    return this;
  },

  /**
   * Handles root element of the manager
   * @param {jQuery|string} $el
   * @returns {Fiber.Views}
   */
  handleRootElement: function($el) {
    if (! $) return $log.debug('Dom manipulation library in not available.');
    if (! ($el instanceof $) && ! $isStr($el))
      $log.error('`$el` should be a valid jQuery element or selector.');
    this.$el = $isStr($el) ? $($el) : $el;
    return this;
  },

  /**
   * Renders view to the destination element
   * @param {string|jQuery} selector
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.Views}
   * @private
   */
  _renderToDestination: function(selector, view) {
    var $destination = this.$el.find(selector);
    if (! $destination.length) $log.error('Destination selector `' + selector + '` is not found in the DOM.');
    if (! (view instanceof Backbone.View)) $log.error('Cannot render View. Not instance of Backbone.View.');
    this._linked.addView(view);
    $destination.html(view.el);
    view.render();
    return this;
  },
});
