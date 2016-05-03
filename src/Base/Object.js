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
    __type: '[object Fiber.Object]'

  }
]));
