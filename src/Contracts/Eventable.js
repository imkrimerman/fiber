/**
 * Eventable Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Eventable = new Fiber.Contract('Eventable', {
  on: Fiber.Types.Function,
  off: Fiber.Types.Function,
  once: Fiber.Types.Function,
  listenTo: Fiber.Types.Function,
  stopListening: Fiber.Types.Function,
  trigger: Fiber.Types.Function
});
