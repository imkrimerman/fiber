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
 * Convert each Base Type to Fiber.Type and add to Fiber.Types storage
 */
$each($BaseTypes, function(options, name) {
  Fiber.Types[name] = new Fiber.Type(options);
});
