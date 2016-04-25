// define base variables
var Fr, Fiber, previousFiber,
// define internal private variables
$fn, $JS, $Const, $Log, $val, $valMerge, $each, $trigger;

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
 * to its previous owner. Returns a reference to this Fiber object
 * @returns {Fiber}
 */
Fiber.noConflict = function() {
  root.Fiber = previousFiber;
  return this;
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
 * Fiber Constants
 * @var {Object}
 */
Fiber.Constants = $Const = {
  allowGlobals: false,
  extensions: {
    private: '__extensions',
    hoisting: '__needPropsHoisting',
  },
  bag: {
    holderKey: 'items'
  },
  log: {
    levels: ['trace', 'debug', 'info', 'warn', 'error'],
    default: 'error',
  },
  template: {
    engine: _.template
  },
  ioc: {
    private: '__inject',
    regex: {
      ARGS: /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
      ARG_SPLIT: /,/,
      ARG: /^\s*(_?)(\S+?)\1\s*$/,
      STRIP_COMMENTS: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
    }
  }
};

/**
 * Fiber Command Bus module
 * @var {Object}
 */
Fiber.Commands = {};

/**
 * Fiber system object
 * @type {Object}
 */
Fiber.system = {};

/**
 * Object to use internally
 * @type {Object}
 */
Fiber.internal = {
  events: _.extend({}, Backbone.Events)
};

/**
 * Native JS prototypes
 * @type {Object}
 * @private
 */
$JS = {
  arr: Array.prototype,
  obj: Object.prototype
};
