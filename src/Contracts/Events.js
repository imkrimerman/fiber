/**
 * Events Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Events = new Fiber.Contract('Events', _.omit($fn.merge(
  $fn.createPlain($fn.methods(Fiber.Events), Fiber.Types.Function), {
    _channels: Fiber.Types.Object,
    _responders: Fiber.Types.Object,
  }), ['$mix'])
);
