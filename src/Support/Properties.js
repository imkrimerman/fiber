// define base Fiber variables
var Fr, Fiber, previousFiber,
// define Internal variables
  $doc, $PropNames, $fn, $val, $valMerge, $valIncludes, $isDef, $each, $origEach, $trigger,
  $iteratee, $matches, $Types, BaseClass, $log, $Ioc, $Env, $State, Listeners, RouterCollection,
  BaseJSTypes, BaseFiberTypes, BaseModel, BaseCollection, $DelegatableFn, $ProtoFunction;

/**
 * Property names map
 * @type {Object}
 */
$PropNames = {
  type: '_signature',
  contract: '_implements',
  injection: '_injection'
};

/**
 * Global document reference
 * @type {HTMLElement|void}
 */
$doc = root.document;

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
 * Attach `lodash`
 * @type {function()}
 */
Fiber._ = _;

/**
 * Attach dom manipulation library (optional)
 * @type {function()}
 */
Fiber.$ = $;

/**
 * Fiber types
 * @type {Object}
 */
Fiber.Types = {};

/**
 * Fiber Contracts classes
 * @type {Object}
 */
Fiber.Contracts = {};

/**
 * Fiber Mocks integration
 * @type {Object}
 */
Fiber.Mocks = {};

/**
 * Fiber Command Bus
 * @var {Object}
 */
Fiber.Commands = {};

/**
 * Object to use internally
 * @type {Object}
 */
Fiber.internal = {
  events: _.extend({}, Backbone.Events),
  properties: $PropNames
};
