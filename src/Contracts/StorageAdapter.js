/**
 * Storage Adapter Contract
 * @type {Object.<Fiber.Contract>}
 */
Fiber.Contracts.StorageAdapter = new Fiber.Contract('StorageAdapter', [
  'Access', {
    request: Fiber.Types.Function,
    response: Fiber.Types.Function
  }
]);
