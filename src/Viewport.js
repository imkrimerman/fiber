/**
 * Fiber Viewport Class
 * @class
 * @extends {Fiber.View}
 */
Fiber.Viewport = Fiber.View.extend({

  /**
   * Current composed route
   * @type {Object.<Fiber.View>}
   */
  view: null,

  /**
   * Current layout
   * @type {Object.<Fiber.View>|null}
   */
  layoutManager: null,

  /**
   * Initializes viewport
   */
  initialize: function() {
    this.layoutManager = new Fiber.LayoutManager();
  },

  /**
   * Shows view
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.Viewport}
   */
  show: function(view) {
    this.close();

    this.view = view;
    view.render();

    this.addViewToElement(view);
    return this;
  },

  /**
   * Returns element to show the view
   * @returns {jQuery}
   */
  getViewElement: function() {
    var element = this.layoutManager.getElement();
    if (! element) element = this.$el;
    return element;
  },

  /**
   * Shows view in handled element
   * @param {Object.<Fiber.View>} view
   * @return {Fiber.Viewport}
   */
  addViewToElement: function(view) {
    var element = this.getViewElement();
    if (element) element.html(view.el);
    return this;
  },

  /**
   * Closes current view
   * @return {Fiber.Viewport}
   */
  close: function() {
    if (this.view instanceof Fiber.View) this.view.remove();
    this.view = null;
    this.$el.empty();
    return this;
  },


});
