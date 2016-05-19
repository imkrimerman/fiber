/**
 * Fiber Command Bus Registry
 * @class
 * @extends {BaseCollection}
 */
Fiber.Commands.Registry = BaseCollection.extend({

  /**
   * Default Registry model
   * @type {Object.<Fiber.Model>}
   */
  model: BaseModel.extend({
    idAttributes: 'name',
    defaults: {name: '', command: null, handler: null}
  }),

});
