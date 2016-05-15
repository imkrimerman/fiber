/**
 * Events Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Eventable = new Fiber.Contract('Eventable',
  _.omit($fn.createPlain($fn.methods(Fiber.Events), Fiber.Types.Function), ['$mix'])
);
