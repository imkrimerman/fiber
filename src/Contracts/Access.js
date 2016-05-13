/**
 * Access Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Access = new Fiber.Contract('Access', {
  get: Fiber.Types.Function,
  set: Fiber.Types.Function,
  has: Fiber.Types.Function,
  forget: Fiber.Types.Function,
  result: Fiber.Types.Function
});
