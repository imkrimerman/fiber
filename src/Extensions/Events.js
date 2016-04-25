/**
 * Events Extension
 * @type {Function}
 * @constructor
 */
var $Events = new Fiber.Extension('Events', Fiber.Events.instance());

/**
 * Register Extension
 */
Fiber.fn.extensions.register($Events);
