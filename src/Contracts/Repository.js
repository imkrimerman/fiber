/**
 * Repository Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Repository = new Fiber.Contract('Repository', [
  'Access', {
    request: Fiber.Types.Function,
    response: Fiber.Types.Function
  }
]);
