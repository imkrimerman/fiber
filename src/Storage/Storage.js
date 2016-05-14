/**
 * Repository
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Storage = Fiber.Bag.extend({

  /**
   * Repository connection adapter
   * @type {Object.<Fiber.Storage.Adapter>}
   */
  _connection: null,

  constructor: function(connection) {
    this._connection = connection;
  },

});
