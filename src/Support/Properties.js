// define base Fiber variables
var Fr, Fiber, previousFiber,
// define internal private variables
$fn, $val, $valMerge, $isDef, $each, $trigger, $msg, $private, $privateHas,
// define internal common class variable
$Log, $Ioc, $Env, $State, $Model, $Collection, $Listeners, $RouterCollection;

/**
 * Fiber main object
 * @type {Object}
 */
Fiber = Fr = exports;

/**
 * Save the previous value of the `Fiber` variable, so that it can be
 * restored later on, if `noConflict` is used
 * @private
 */
previousFiber = root.Fiber;

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
 * Add `lodash` to the Fiber
 * @type {Function}
 */
Fiber._ = _;

/**
 * Exposed jQuery (or similar) from Backbone
 * @type {Function}
 */
Fiber.$ = $;

/**
 * Fiber Command Bus module
 * @var {Object}
 */
Fiber.Commands = {};

/**
 * Object to use internally
 * @type {Object}
 */
Fiber.internal = {
  privateProperty: '__private',
  events: _.extend({}, Backbone.Events),
};
