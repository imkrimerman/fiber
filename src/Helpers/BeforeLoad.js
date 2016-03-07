/**
 * Save the previous value of the `Fiber` variable, so that it can be
 * restored later on, if `noConflict` is used.
 */
var prevFiber = root.Fiber;

/**
 * Runs Fiber.js in `noConflict` mode, returning the `Fiber` variable
 * to its previous owner. Returns a reference to this Fiber object.
 * @returns {Fiber}
 */
Fiber.noConflict = function() {
  root.Fiber = prevFiber;
  return this;
};

/**
 * Add `lodash` to the Fiber.
 * @type {Function}
 */
Fiber._ = _;

/**
 * Exposed jQuery (or similar) from Backbone.
 * @type {Function}
 */
Fiber.$ = $;

/**
 * Fiber Version.
 * @type {string}
 */
Fiber.VERSION = '$VERSION$';

/**
 * Fiber Global object.
 * @var {Object}
 */
Fiber.Globals = {};

/**
 * Fiber Extensions object.
 * @var {Object}
 */
Fiber.Extensions = {};

/**
 * Fiber Services object.
 * @var {Object}
 */
Fiber.Services = {};
