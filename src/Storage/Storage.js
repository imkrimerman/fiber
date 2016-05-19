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
  _connection: null,

  constructor: function(connection) {
    this._connection = connection;
  },

});
