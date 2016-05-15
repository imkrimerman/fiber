/**
 * Response Class
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Sync.Response = Fiber.Bag.extend({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Response]',

  /**
   * Constructs response
   * @param {Object} items
   * @param {Object} [options]
   */
  constructor: function(response, options) {
    this.$superInit(this.prepare(response, options), options);
  },

  /**
   * Prepares request and it's options.
   * @param {Object} response
   * @param {Object} [options]
   * @return {Object}
   */
  prepare: function(response, options) {
    return response;
  }
});

/**
 * Add Response type to Fiber
 */
Fiber.Types.Response = new Fiber.Type({
  type: 'object',
  signature: Fiber.Sync.Response.prototype._signature,
  example: function() {return new Fiber.Sync.Response;}
});
