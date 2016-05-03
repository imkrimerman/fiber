/**
 * Storage Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Storage = new Fiber.Contract('Storage', {
  get: $Types.Function,
  set: $Types.Function,
  has: $Types.Function,
  forget: $Types.Function
});
