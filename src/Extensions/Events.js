/**
 * Events Extension
 * @type {Object.<Fiber.Extension>}
 */
var $Events = new Fiber.Extension('Events', Fiber.Events.$new());

/**
 * Register Extension
 */
$Ioc.extension('Events', $Events);
