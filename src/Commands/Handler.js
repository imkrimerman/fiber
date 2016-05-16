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
    this.$superInit();
    this.command = command;
    this.handle = $fn.wrapFireCallCyclic(this.handle, 'handle', {
      fire: [this.command, this], call: [this.command, this]
    });
  },

  /**
   * Handles command
   * @param {...args}
   * @returns {Fiber.Services.Commands.Handler}
   */
  handle: function() {
    $log.error('`Handler` should implement it\'s own `handle` method.');
  }
});
