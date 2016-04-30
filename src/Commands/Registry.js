/**
 * Fiber Command Bus Registry
 * @class
 * @extends {Fiber.Collection}
 */
Fiber.Commands.Registry = $Collection.extend({

  /**
   * Default Registry model
   * @type {Object.<Fiber.Model>}
   */
  model: $Model.extend({
    idAttributes: 'name',
    defaults: {
      name: '',
      command: null,
      handler: null
    }
  }),

});
