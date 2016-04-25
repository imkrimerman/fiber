/**
 * Events Extension
 * @type {Object.<Fiber.Extension>}
 */
var $Events = new Fiber.Extension('Events', Fiber.Events.instance());

/**
 * Register Extension
 */
$fn.extensions.register($Events);
