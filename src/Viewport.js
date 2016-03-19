/**
 * Fiber Viewport Class
 * @class
 * @extends {Fiber.View}
 */
Fiber.Viewport = Fiber.View.extend({

  current: null,

  show: function(view) {
    this.close();

    this.current = view;
    view.render();
    this.$el.html(view.el);

    return this;
  },

  close: function() {
    this.current = null;
    this.$el.empty();
  },

});
