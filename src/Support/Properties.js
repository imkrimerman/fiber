// define base Fiber variables
var Fr, Fiber, previousFiber, $Fiber = {},
// define Internal variables
  $doc, $fn, $val, $valMerge, $isDef, $each, $origEach, $trigger, $msg, $private, $privateHas, $iteratee, $matches,
  $Types, $Config, $TypeChecker, $BaseClass, $dom, $Log, $Ioc, $Env, $State, $DomElement, $Model, $Collection, $Listeners,
  $RouterCollection, BaseJSTypes, BaseFiberTypes;

/**
 * Configuration
 * @type {Object}
 */
$Fiber.Config = $Config = {
  access: {
    key: '_access',
    default: 'public',
    properties: {const: '$$const', private: '$$private'}
  },
  private: {key: '__private'},
  type: {key: '_signature'},
  contracts: {key: '_implements'},
  injection: {key: '_injection'}
};

/**
 * Global document reference
 * @type {HTMLElement|void}
 */
$Fiber.doc = $doc = root.document;

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
 * Attach dom manipulation library if provided
 * @type {Function}
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
};
