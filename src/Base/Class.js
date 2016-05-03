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
    __type: '[object Fiber.Class]',

    /**
     * Constructs class
     * @param {?Object} [options]
     */
    constructor: $fn.class.createConstructor()
  }
]);
