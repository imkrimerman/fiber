/**
 * Fiber Object
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Object = Fiber.Class.extend($fn.extensions.listNames().concat([
  {

    /**
     * Class type signature
     * @type {string}
     * @private
     */
    _signature: '[object Fiber.Object]'

  }
]));

/**
 * Add Object type to Fiber
 */
Fiber.Types.Object = new Fiber.Type({
  type: 'object',
  signature: Fiber.Object.prototype._signature,
  defaults: Fiber.Object
});
