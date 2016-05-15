/**
 * Define public Fiber variables.
 */
var Fr, Fiber;

/**
 * Fiber main object.
 * @type {Object}
 */
Fiber = Fr = exports;

/**
 * Save the previous value of the `Fiber` variable, so that it can be
 * restored later on, if `noConflict` is used
 * @private
 */
var previousFiber = root.Fiber;

/**
 * Runs Fiber.js in `noConflict` mode, returning the `Fiber` variable
 * to its previous owner. Returns a reference to the  Fiber object
 * @returns {Fiber}
 */
Fiber.noConflict = function() {
  root.Fiber = previousFiber;
  return root.Fiber;
};

/**
 * Attach `lodash`
 * @type {function(...)}
 */
Fiber._ = _;

/**
 * Attach dom manipulation library (optional)
 * @type {function(...)}
 */
Fiber.$ = $;

/**
 * Fiber Types storage
 * @type {Object}
 */
Fiber.Types = {};

/**
 * Fiber Contracts storage
 * @type {Object}
 */
Fiber.Contracts = {};

/**
 * Fiber Mixin storage
 * @type {Object}
 */
Fiber.Mixins = {};

/**
 * Fiber Mocks module
 * @type {Object}
 */
Fiber.Mocks = {};

/**
 * Fiber Command Bus
 * @var {Object}
 */
Fiber.Commands = {};

/**
 * Internally used storage
 * @type {Object}
 */
Fiber.internal = {
  events: _.extend({}, Backbone.Events),
};

/**
 * Global document reference
 * @type {HTMLElement|void}
 */
var doc = root.document;

/**
 * Property names map.
 * @type {Object}
 */
var $propNames = {
  type: '_signature',
  contract: '_implements',
  injection: '_injection'
};
