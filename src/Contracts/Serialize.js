/**
 * Serialize Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Serialize = new Fiber.Contract('Serialize', {
  serialize: Fiber.Types.Function,
  fromSerialized: Fiber.Types.Function
});
