/**
 * Serialize Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Serializable = new Fiber.Contract('Serializable', {
  serialize: Fiber.Types.Function,
  fromSerialized: Fiber.Types.Function
});
