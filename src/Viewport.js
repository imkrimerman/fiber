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

});
