/**
 * Fiber Viewport
 * @class
 * @extends {Fiber.View}
 */
Fiber.Viewport = Fiber.View.extend({

  /**
   * Class options
   * @type {Array}
   */
  extendable: ['layouts', 'layout', 'defaultLayout'],

  /**
   * Own properties
   * @type {Array}
   */
  ownProps: ['layouts', 'layout', 'defaultLayout'],

  /**
   * Layouts
   * @type {Object}
   */
  layouts: {},

  /**
   * Current layout
   * @type {Object<Layout>}
   */
  layout: null,

  /**
   * Current layout key
   * @type {string}
   */
  defaultLayout: 'fullFrame',

  /**
   * Initializes Viewport
   */
  initialize: function() {
    if (! this.layout) this.createLayout();
  },

  /**
   * Shows page
   * @param {Object.<Fiber.Page>} page
   * @returns {Fiber.Viewport}
   */
  show: function(page) {
    var layout = page.get('layout') || this.defaultLayout
      , options = {};

    if (_.isPlainObject(layout)) {
      options = layout.options || {};
      layout = layout.type;
    }

    if (layout !== this.defaultLayout)
      this.createLayout(layout, options);

    this.renderLayout();
    this.layout.renderPage(page);
    return this;
  },

  /**
   * Renders layout if it's not rendered
   * @param {boolean} [force]
   * @returns {Fiber.Viewport}
   */
  renderLayout: function(force) {
    force = force !== void 0 ? force : false;
    if (! this.layout.isRendered() || force) this.layout.render();
    return this;
  },

  /**
   * Creates layout by given `alias`
   * @param {string} [alias]
   * @pram {Object} [options]
   * @returns {Object<Layout>}
   */
  createLayout: function(alias, options) {
    this.clear();
    alias = val(alias, this.defaultLayout, _.isString);
    this.defaultLayout = alias;
    return this.layout = new this.layouts[alias](options);
  },

  /**
   * Closes page
   * @returns {Fiber.Viewport}
   */
  close: function() {
    this.layout.removePage();
    return this;
  },

  /**
   * Clears
   * @returns {Fiber.Viewport}
   */
  clear: function() {
    this.removeLayout();
    this.$el.html('');
    return this;
  },

  /**
   * Resets Viewport
   * @returns {Fiber.Viewport}
   */
  reset: function() {
    this.defaultLayout = _.first(_.keys(this.layouts));
    this.clear();
    return this;
  },

  /**
   * Removes layout
   * @returns {Fiber.Viewport}
   */
  removeLayout: function() {
    if (this.layout) {
      this.layout.remove();
      this.layout = null;
    }
    return this;
  }
});
