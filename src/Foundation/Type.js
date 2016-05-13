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
   * @type {Object|function()}
   */
  _defaults: {
    type: null,
    signature: null,
    defaults: $val.notDefined,
    caster: $fn.constant
  },

  /**
   * Constructs Type
   * @param {Object} options
   */
  constructor: function(options) {
    options = $valMerge(options, $fn.result(this._defaults), 'defaults');
    if (! this._isValidOptions(options)) $Log.errorThrow('Can not create new type. `Options` are not valid.');
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
  getDefaults: function(options) {
    var defaults = this._type.defaults;
    if ($fn.class.isClass(defaults)) return $fn.class.instance(defaults, options);
    if (this.getType() === Fiber.Types.Function.getType()) return defaults;
    return $fn.result(defaults);
  },

  /**
   * Returns casting function
   * @returns {*}
   */
  getCaster: function() {
    return this._type.caster;
  },

  /**
   * Determines if given options are valid to create new Type
   * @param {Object} [options]
   * @returns {boolean}
   * @private
   */
  _isValidOptions: function(options) {
    options = $val(options, {}, _.isPlainObject);
    return _.isString(options[$fn.types.lookUpKeys.type]) && _.isString(options[$fn.types.lookUpKeys.signature]);
  },
});

/**
 * Base JavaScript Types
 * @type {Object}
 */
var BaseES5Types = {
  Arguments: {type: 'object', signature: '[object Arguments]', defaults: []},
  Array: {type: 'object', signature: '[object Array]', defaults: []},
  Object: {type: 'object', signature: '[object Object]', defaults: {}},
  Boolean: {type: 'boolean', signature: '[object Boolean]', defaults: false},
  Function: {type: 'function', signature: '[object Function]', defaults: _.noop},
  String: {type: 'string', signature: '[object String]', defaults: ''},
  Number: {type: 'number', signature: '[object Number]', defaults: 0},
  Date: {type: 'object', signature: '[object Date]', defaults: new Date},
  RegExp: {type: 'object', signature: '[object RegExp]', defaults: new RegExp},
  NaN: {type: 'number', signature: '[object Number]', defaults: NaN},
  Null: {type: 'object', signature: '[object Null]', defaults: null},
  Undefined: {type: 'undefined', signature: '[object Undefined]', defaults: void 0},
  Error: {type: 'object', signature: '[object Error]', defaults: new Error}
};

/**
 * Base ES6 Types
 * @type {Object}
 */
var BaseES6Types = {
  Map: {type: 'object', signature: '[object Function]', defaults: (typeof Map == 'object') ? new Map : {}},
  Set: {type: 'object', signature: '[object Function]', defaults: (typeof Set == 'object') ? new Set : {}},
  WeakMap: {type: 'object', signature: '[object Function]', defaults: (typeof WeakMap == 'object') ? new WeakMap : {}},
  WeakSet: {type: 'object', signature: '[object Function]', defaults: (typeof WeakSet == 'object') ? new WeakSet : {}},
  Symbol: {type: 'symbol', signature: '[object Symbol]', defaults: (typeof Symbol == 'symbol') ? Symbol() : void 0},
};

/**
 * Convert and add all types to Fiber.Types
 */
$each($fn.merge(BaseES5Types, BaseES6Types), function(options, name) {
  Fiber.Types[name] = new Fiber.Type(options);
});
