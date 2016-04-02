/**
 * Fiber Command Handler
 * @class
 */
Fiber.Services.Commands.Handler = Fiber.fn.class.create([
  Fiber.Events, {

    /**
     * Constructs Command Handler
     * @param {Object.<Fiber.Command>} command
     */
    constructor: function(command) {
      this.command = command;
      //todo: test if this.handle will be set properly without manual setting
      Fiber.fn.wrapFireCallCyclic(this.handle, 'handle', {
        fire: [this.command, this], call: [this.command, this]
      });
    },

    /**
     * Handles command
     * @returns {Fiber.Services.Commands.Handler}
     */
    handle: function() {
      Fiber.logs.system.errorThrow('Handler should implement it\'s own `handle` method');
      return this;
    }
  }
]);
