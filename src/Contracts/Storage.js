/**
 * Storage Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Storage = new Fiber.Contract('Storage', {
  get: Fiber.Types.Function,
  set: Fiber.Types.Function,
  has: Fiber.Types.Function,
  forget: Fiber.Types.Function
});
