/**
 * Fiber Base Class
 * @class
 */
Fiber.Class = $fn.class.create([
  Fiber.Events, {

    /**
     * Class type signature
     * @type {string}
     * @private
     */
    __signature: '[object Fiber.Class]'
  }
]);

/**
 * Add Class type to Fiber
 */
Fiber.Types.Class = new Fiber.Type({
  type: 'object',
  signature: Fiber.Class.prototype.__signature,
  defaults: Fiber.Class
});
