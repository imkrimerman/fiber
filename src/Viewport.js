/**
 * Fiber Viewport Class
 * @class
 * @extends {Fiber.View}
 */
Fiber.Viewport = Fiber.View.extend({

  /**
   * Current composed route view
   * @type {Object.<Fiber.View>}
   */
  view: null,

  /**
   * Current layout
   * @type {Object.<Fiber.View>|null}
   */
  layout: null,

  show: function(view, layout) {
    this.setView(view);

    if (this.hasLayout()) {
      this.setLayout(layout);
      this.renderLayout(layout);
    }

    this.renderView(view);
    return this;
  },

  close: function(options) {
    options = _.defaults({}, $val(options, {}, _.isPlainObject), { view: true, layout: false });
    if (options.view) this.removeView();
    if (options.layout) this.removeLayout();
    return this;
  },

  renderView: function(view) {
    if (! this.hasLayout()) {
      this.renderToViewportElement(view);
      return this;
    }

    this.renderToViewportElement(this.layout);
    this.renderViewToLayout(view);
    return this;
  },

  renderViewToLayout: function(view) {
    if (! this.hasLayout())
      $log.error('`renderViewToLayout` should be called' +
                  ' only if layout is available', this.layout, this);

    if (! this.layout.isRendered()) {
      this.renderLayout(this.layout);
    }

    this.layout.renderToContentElement(view);
    return this;
  },

  renderLayout: function(layout) {
    layout.render();
    return layout.el;
  },

  renderToViewportElement: function(view) {
    if (view instanceof Fiber.View) {
      view.render();
      this.$el.html(view.el);
      return true;
    }

    return false;
  },

  removeView: function() {
    if (this.hasView()) this.view.remove();
    return this;
  },

  removeLayout: function() {
    if (this.hasLayout()) {
      this.removeView();
      this.layout.remove();
    }

    return this;
  },

  setView: function(view) {
    return this.view = $val(view, this.view, function(val) {
      return val instanceof Fiber.View;
    });
  },

  setLayout: function(layout) {
    return this.layout = $val(layout, this.layout, function(val) {
      return val instanceof Fiber.Layout;
    });
  },

  getView: function() {
    return this.view;
  },

  getLayout: function() {
    return this.layout;
  },

  hasView: function() {
    return this.getView() instanceof Fiber.View;
  },

  hasLayout: function() {
    return this.getLayout() instanceof Fiber.Layout;
  },
});
