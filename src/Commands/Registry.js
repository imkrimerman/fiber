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

});
