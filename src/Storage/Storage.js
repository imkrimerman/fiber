/**
 * Storage
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Storage = Fiber.Bag.extend({

  /**
   * Storage connection adapter
   * @type {Object.<Fiber.Repository.Adapter>}
   */
  connection: null,

  constructor: function(connection) {
    this.connection = connection;
  },

});
