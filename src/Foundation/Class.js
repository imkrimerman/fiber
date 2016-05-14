/**
 * Fiber Base Class
 * @class
 * @extends {BaseClass}
 */
Fiber.Class = BaseClass.implement('Events').extend([
  Fiber.Events, {

    /**
     * Class type signature
     * @type {string}
     * @private
     */
    _signature: '[object Fiber.Class]'
  }
]);

/**
 * Add Class type to Fiber
 */
Fiber.Types.Class = new Fiber.Type({
  type: 'object',
  signature: Fiber.Class.prototype._signature,
  example: function() {return new Fiber.Class;}
});