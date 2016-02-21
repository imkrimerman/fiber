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
  extendable: ['layouts', 'layout', 'layoutKey'],

  /**
   * Own properties
   * @type {Array}
   */
  ownProps: ['layouts', 'layout', 'layoutKey'],

  /**
   * Default layout
   * @type {String}
   */
  defaultLayout: 'fullFrame',

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
   * @type {String}
   */
  layoutKey: 'fullFrame',

  /**
   * Initializes Viewport
   */
  initialize: function() {
    if (! this.layout) this.createLayout();
  },

  /**
   * Shows page
   * @param {Page} page
   * @param {String|Object} layout
   * @returns {Viewport}
   */
  show: function(page, layout) {
    var layout = layout || this.defaultLayout
      , options = {};

    if (_.isPlainObject(layout)) {
      options = layout.options || {};
      layout = layout.type;
    }

    if (layout !== this.layoutKey)
      this.createLayout(layout, options);

    this.renderLayout();
    this.layout.renderPage(page);
    return this;
  },

  /**
   * Renders layout if it's not rendered
   * @param [{boolean}] force
   * @returns {Viewport}
   */
  renderLayout: function(force) {
    force = force !== void 0 ? force : false;
    if (! this.layout.rendered || force) this.layout.render();
    return this;
  },

  /**
   * Closes page
   * @return {Viewport}
   */
  close: function() {
    this.layout.removePage();
    return this;
  },

  /**
   * Clears
   * @returns {Viewport}
   */
  clear: function() {
    this.removeLayout();
    this.$el.html('');
    return this;
  },

  /**
   * Resets Viewport
   * @return {Viewport}
   */
  reset: function() {
    this.layoutKey = _.first(_.keys(this.layouts));
    this.clear();
    return this;
  },

  /**
   * Creates layout by given `alias`
   * @param [{String}] alias
   * @pram [{Object}] options
   * @returns {Object<Layout>}
   */
  createLayout: function(alias, options) {
    this.clear();
    alias = this.val(alias, this.layoutKey, _.isString);
    this.layoutKey = alias;
    this.layout = new this.layouts[alias](options);
    this.layout.render();
    this.$el.html(this.layout.$el);
    return this.layout;
  },

  /**
   * Removes layout
   * @returns {Viewport}
   */
  removeLayout: function() {
    if (this.layout) {
      this.layout.remove();
      this.layout = null;
      this.layoutKey = null;
    }
    return this;
  }
});
