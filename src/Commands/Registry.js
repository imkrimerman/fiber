/**
 * Fiber Command Bus Registry
 * @class
 */
Fiber.Commands.Registry = Fiber.Collection.extend({

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
