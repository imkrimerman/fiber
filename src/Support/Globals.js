/**
 * Add system logger
 * @type {Object.<Fiber.Log>}
 */
Fiber.log = $Log = new Fiber.Log();

/**
 * Global Environment container
 * @type {Object.<Fiber.Bag>}
 */
Fiber.env = $Env = new Fiber.Bag();

/**
 * Global state container
 * @type {Object.<Fiber.Bag>}
 */
Fiber.state = $State = new Fiber.Bag();
