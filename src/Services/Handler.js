/**
 * Fiber Command Handler
 * @class
 */
Fiber.Services.Handler = Fiber.fn.class.create({

  /**
   * Handles command
   * @param {Object.<Fiber.Command>} command
   */
  handle: function(command) {
    throw new Error('Handler should implement own `handle` method');
  },

});
