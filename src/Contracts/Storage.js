/**
 * Storage Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.Storage = new Fiber.Contract('Storage', [
  'Access', {
    find: Fiber.Types.Function,
    findWhere: Fiber.Types.Function,
    where: Fiber.Types.Function,
    request: Fiber.Types.Function
  }
]);
