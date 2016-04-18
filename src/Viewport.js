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

  },

  close: function() {},

  changeLayoutTo: function(layout) {},

  changeViewTo: function(view) {},
});
