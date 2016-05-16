/**
 * Fiber Type
 * @class
 * @extends {BaseClass}
 */
Fiber.Type = BaseClass.extend({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Type]',

  /**
   * Type options defaults
   * @type {Object|function(...)}
   */
  _defaults: {
    type: null,
    signature: null,
    example: $fn.constant,
    caster: $fn.constant
  },

  /**
   * Constructs Type
   * @param {Object} options
   */
  constructor: function(options) {
    options = $valMerge(options, $result(this._defaults), 'defaults');
    this._type = $fn.descriptor.immutable(options);
  },

  /**
   * Type getter
   * @returns {string}
   */
  getType: function() {
    return this._type.type;
  },

  /**
   * Signature getter
   * @returns {string}
   */
  getSignature: function() {
    return this._type.signature;
  },

  /**
   * Returns type default value
   * @returns {*}
   */
  getExample: function(options) {
    var example = this._type.example;
    if ($fn.class.isClass(example)) return $fn.class.instance(example, options);
    return $fn.applyFn(example, options);
  },

  /**
   * Returns casting function
   * @returns {*}
   */
  getCaster: function() {
    return this._type.caster;
  }
});

/**
 * Base JavaScript Types
 * @type {Object}
 */
var BaseES5Types = {
  Arguments: { type: 'object', signature: '[object Arguments]', example: function() {return new Arguments;} },
  Array: { type: 'object', signature: '[object Array]', example: function() {return [];} },
  Object: { type: 'object', signature: '[object Object]', example: function() {return {};} },
  Boolean: { type: 'boolean', signature: '[object Boolean]', example: function() {return false;} },
  Function: { type: 'function', signature: '[object Function]', example: function() {return $fn.noop;} },
  String: { type: 'string', signature: '[object String]', example: function() {return '';} },
  Number: { type: 'number', signature: '[object Number]', example: function() {return 0;} },
  Date: { type: 'object', signature: '[object Date]', example: function() {return new Date;} },
  RegExp: { type: 'object', signature: '[object RegExp]', example: function() {return new RegExp;} },
  NaN: { type: 'number', signature: '[object Number]', example: function() {return NaN;} },
  Null: { type: 'object', signature: '[object Null]', example: function() {return null;} },
  Undefined: { type: 'undefined', signature: '[object Undefined]', example: function() {return void 0;} },
  Error: { type: 'object', signature: '[object Error]', example: function() {return new Error;} }
};

/**
 * Base ES6 Types
 * @type {Object}
 */
var BaseES6Types = {
  Map: {
    type: 'object',
    signature: '[object Function]',
    example: function() {return (typeof Map == 'object') ? new Map : {};}
  },
  Set: {
    type: 'object',
    signature: '[object Function]',
    example: function() {return (typeof Set == 'object') ? new Set : {};}
  },
  WeakMap: {
    type: 'object',
    signature: '[object Function]',
    example: function() {return (typeof WeakMap == 'object') ? new WeakMap : {};}
  },
  WeakSet: {
    type: 'object',
    signature: '[object Function]',
    example: function() {return (typeof WeakSet == 'object') ? new WeakSet : {};}
  },
  Symbol: {
    type: 'symbol',
    signature: '[object Symbol]',
    example: function() {return (typeof Symbol == 'symbol') ? Symbol() : void 0;}
  },
};

/**
 * Convert and add all types to Fiber.Types
 */
$each($fn.merge(BaseES5Types, BaseES6Types), function(options, name) {
  Fiber.Types[name] = new Fiber.Type(options);
});
