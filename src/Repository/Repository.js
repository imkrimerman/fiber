/**
 * Repository
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Repository = Fiber.Bag.extend({

  /**
   * Repository connection adapter
   * @type {Object.<Fiber.Repository.Adapter>}
   */
  _connection: null,

  constructor: function(connection) {
    this._connection = connection;
  },

});
