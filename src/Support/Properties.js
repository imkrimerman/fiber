// define base Fiber variables
var Fr, Fiber, previousFiber,
// define Internal variables
  $doc, $fn, $val, $valMerge, $isDef, $each, $origEach, $trigger, $msg, $private, $privateHas, $iteratee, $matches,
  $Types, $Config, $TypeChecker, $dom, $Log, $Ioc, $Env, $State, $DomElement, $Model, $Collection, $Listeners,
  $RouterCollection, BaseJSTypes, BaseFiberTypes;

/**
 * Configuration
 * @type {Object}
 */
$Config = {
  private: {key: '__private'},
  access: {key: '__access', default: 'public'},
  type: {key: '__signature'},
  contracts: {key: '__implements'},
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
 * Add `lodash` to the Fiber
 * @type {Function}
 */
Fiber._ = _;

/**
 * Object to use internally
 * @type {Object}
 */
Fiber.Internal = {
  events: _.extend({}, Backbone.Events),
  monitor: _.extend({}, Backbone.Events),
};

/**
 * Fiber Command Bus
 * @var {Object}
 */
Fiber.Commands = {};

/**
 * Fiber Contracts classes
 * @type {Object}
 */
Fiber.Contracts = {};

/**
 * Fiber types
 * @type {Object}
 */
Fiber.Types = {};
