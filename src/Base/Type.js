/**
 * Fiber Type
 * @class
 */
Fiber.Type = $fn.class.implement(Fiber.Contracts.Type).extend({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  __type: '[object Fiber.Type]',

  /**
   * Constructs Type
   * @param {string} type
   * @param {string} signature
   * @param {*} defaults
   */
  constructor: function(type, signature, defaults) {
    this[$Config.private.key] = $fn.descriptor.immutable({
      type: type,
      signature: signature,
      defaults: defaults || $val.notDefined
    });
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
  getDefaults: function() {
    return this[$Config.private.key].defaults;
  }
});

/**
 * Fiber types
 * @type {Object}
 */
Fiber.Types = $Types = {
  // Native types
  Array: new Fiber.Type('object', '[object Array]', []),
  Object: new Fiber.Type('object', '[object Object]', {}),
  Boolean: new Fiber.Type('boolean', '[object Boolean]', false),
  Function: new Fiber.Type('function', '[object Function]', _.noop),
  Number: new Fiber.Type('number', '[object Number]', 0),
  NaN: new Fiber.Type('number', '[object Number]', NaN),
  Null: new Fiber.Type('object', '[object Null]', null),
  String: new Fiber.Type('string', '[object String]', ''),
  Undefined: new Fiber.Type('undefined', '[object Undefined]', void 0),
};
