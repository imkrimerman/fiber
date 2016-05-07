/**
 * Fiber Type
 * @class
 */
Fiber.Type = $fn.class.create({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  __signature: '[object Fiber.Type]',

  /**
   * Type options defaults
   * @type {Object|Function}
   */
  __defaults: {
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
    var config = $valMerge(options, $fn.result(this.__defaults), 'defaults');
    if (! this.__isValidOptions(config)) $Log.errorThrow('Cannot create new type. `Options` are not valid.');
    this[$Config.private.key] = $fn.descriptor.immutable(config);
  },

  /**
   * Type getter
   * @returns {string}
   */
  getType: function() {
    return this[$Config.private.key].type;
  },

  /**
   * Signature getter
   * @returns {string}
   */
  getSignature: function() {
    return this[$Config.private.key].signature;
  },

  /**
   * Returns type default value
   * @returns {*}
   */
  getDefaults: function(options) {
    var defaults = this[$Config.private.key].defaults;
    if ($fn.class.isClass(defaults)) return $fn.class.instance(defaults, options);
    if (this.getType() === Fiber.Types.Function.getType()) return defaults;
    return $fn.result(defaults);
  },

  /**
   * Returns casting function
   * @returns {*}
   */
  getCaster: function() {
    return this[$Config.private.key].caster;
  },

  /**
   * Determines if given options are valid to create new Type
   * @param {Object} [options]
   * @returns {boolean}
   * @private
   */
  __isValidOptions: function(options) {
    options = $val(options, {}, _.isPlainObject);
    return _.isString(options[$fn.types.lookUpKeys.type]) && _.isString(options[$fn.types.lookUpKeys.signature]);
  },
});

/**
 * Base JavaScript Types
 * @type {Object}
 */
var BaseJSTypes = {
  Array: {type: 'object', signature: '[object Array]', defaults: []},
  Object: {type: 'object', signature: '[object Object]', defaults: {}},
  Boolean: {type: 'boolean', signature: '[object Boolean]', defaults: false},
  Function: {type: 'function', signature: '[object Function]', defaults: _.noop},
  String: {type: 'string', signature: '[object String]', defaults: ''},
  Number: {type: 'number', signature: '[object Number]', defaults: 0},
  NaN: {type: 'number', signature: '[object Number]', defaults: NaN},
  Null: {type: 'object', signature: '[object Null]', defaults: null},
  Undefined: {type: 'undefined', signature: '[object Undefined]', defaults: void 0}
};

/**
 * Base Fiber Types
 * @type {Object}
 */
var BaseFiberTypes = {
  Type: {type: 'object', signature: Fiber.Type.prototype.__signature, defaults: Fiber.Type}
};

/**
 * Convert and add all types to Fiber.Types
 */
$each($fn.merge(BaseJSTypes, BaseFiberTypes), function(options, name) {
  Fiber.Types[name] = new Fiber.Type(options);
});
