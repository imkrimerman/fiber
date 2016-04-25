/**
 * Fiber Base Class
 * @class
 */
Fiber.Class = $fn.class.create([
  Fiber.Events, {

    /**
     * Constructs simple class
     * @param {?Object} [options]
     */
    constructor: function(options) {
      $fn.class.handleOptions(this, options);
      $fn.apply(this, 'initialize', [arguments]);
    }
  }
]);
