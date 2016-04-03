/**
 * Fiber Command Handler
 * @class
 */
Fiber.Commands.Handler = Fiber.fn.class.create([
  Fiber.Events, {

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
     * @returns {Fiber.Services.Commands.Handler}
     */
    handle: function() {
      Fiber.logs.system.errorThrow('Handler should implement it\'s own `handle` method');
    }
  }
]);
