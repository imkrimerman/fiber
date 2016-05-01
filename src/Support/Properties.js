// define base Fiber variables
var Fr, Fiber, previousFiber,
// define internal private variables
$fn, $Const, $Log, $val, $valMerge, $isDef, $each, $trigger, $ioc, $errors,
// define internal common class variable
$Model, $Collection, $Listeners, $RouterCollection;

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
 * Fiber Constants
 * @var {Object}
 */
Fiber.Constants = $Const = {
  extensions: {
    private: '__extensions',
    migration: '__needsPropMigration',
  },
  bag: {
    holderKey: 'items'
  },
  log: {
    levels: ['trace', 'debug', 'info', 'warn', 'error'],
    default: 'error',
    fallback: console.log
  },
  template: {
    engine: _.template,
    imports: {
      Fiber: Fiber,
      Fr: Fiber,
      $fn: $fn,
      $val: $val,
      $each: $each,
      $ioc: $ioc
    },
    settings: {
      evaluate: /{{([\s\S]+?)}}/g,
      interpolate: /{{=([\s\S]+?)}}/g,
      escape: /{{-([\s\S]+?)}}/g
    }
  },
  validation: {
    messages: '__messages'
  },
  state: {
    private: '__state'
  },
  access: {
    private: '__access',
    methods: ['get', 'set', 'has', 'result', 'unset'],
    defaults: 'public',
    allow: {
      private: false,
      protected: ['get', 'result', 'has'],
      public: true
    }
  },
  computed: {
    private: '__willCompute',
    defaultPostfix: 'Attribute',
    modelPostfix: 'computePostfix',
  },
  injection: {
    private: '__injection',
    allowedTypes: ['function'],
    sharedMethods: ['get', 'has', ['inject', 'applyInject']]
  },
  ioc: {
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
 * Object to use internally
 * @type {Object}
 */
Fiber.internal = {
  events: _.extend({}, Backbone.Events)
};
