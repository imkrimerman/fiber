/**
 * Fiber Command Bus Registry
 * @class
 */
Fiber.Services.Commands.Registry = Fiber.Collection.extend({

  /**
   * Default Registry model
   * @type {Object.<Fiber.Model>}
   */
  model: Fiber.Model.extend({
    idAttributes: 'name',
    defaults: {
      name: '',
      command: null,
      handler: null
    }
  }),

  /**
   * Returns command by name or undefined
   * @param {string} name
   * @returns {Object.<Fiber.Command>|undefined}
   */
  getCommandByName: function(name) {
    if (this.has(name)) return this.get(name).get('command');
    return void 0;
  },
});
