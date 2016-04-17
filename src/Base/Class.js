/**
 * Fiber Base Class
 * @class
 */
Fiber.Class = Fiber.fn.class.create([
  Fiber.Events, {

    /**
     * Constructs simple class
     * @param {?Object} [options]
     */
    constructor: function(options) {
      Fiber.fn.class.handleOptions(this, options);
      Fiber.fn.apply(this, 'initialize', [arguments]);
    }
  }
]);
