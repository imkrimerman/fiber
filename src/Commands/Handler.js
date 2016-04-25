/**
 * Fiber Command Handler
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Commands.Handler = Fiber.Class.extend({

  /**
   * Constructs Command Handler
   * @param {Object.<Fiber.Command>} command
   */
  constructor: function(command) {
    this.command = command;
    this.handle = Fiber.fn.wrapFireCallCyclic(this.handle, 'handle', {
      fire: [this.command, this], call: [this.command, this]
    });
  },

  /**
   * Handles command
   * @param {...args}
   * @returns {Fiber.Services.Commands.Handler}
   */
  handle: function() {
    Fiber.internal.logger.errorThrow('Handler should implement it\'s own `handle` method');
  }
});
