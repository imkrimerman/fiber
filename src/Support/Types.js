/**
 * Type Checker
 * @type {Object}
 */
Fiber.fn.types = {

  /**
   * Default Type properties map
   * @type {Object}
   */
  defaults: {
    type: 'type',
    signature: 'signature',
    example: 'example'
  },

  /**
   * Function to apply same transformation before check
   * @type {function(...)}
   */
  transformer: $typeTransformer,

  /**
   * Returns transformed string type.
   * @param {string} string
   * @returns {string}
   */
  transform: function(string) {
    return $fn.types.transformer.call(string);
  },

  /**
   * Determines if arg matches typeof conversion
   * @param {*} arg
   * @param {Object.<Fiber.Type>|string} type
   * @returns {boolean}
   */
  matchesType: function(arg, type) {
    var argType = $fn.types.parseType(arg, true);
    type = type instanceof Fiber.Type ? type.getType() : type;
    if ($isPlain(type) && $has(type, $fn.types.defaults.type))
      type = $get(type, $fn.types.defaults.type);
    return argType === $fn.types.transform(type);
  },

  /**
   * Determines if arg matches type signature
   * @param {*} arg
   * @param {Object.<Fiber.Type>|string} type
   * @returns {boolean}
   */
  matchesSignature: function(arg, type) {
    var signature = $fn.types.parseSignature(arg, true);
    type = type instanceof Fiber.Type ? type.getSignature() : type;
    if ($isPlain(type) && $has(type, $fn.types.defaults.signature))
      signature = $get(type, $fn.types.defaults.signature);
    return signature === $fn.types.transform(type);
  },

  /**
   * Determines if arg is matches the type
   * @param {*} arg
   * @param {string|Object|Object.<Fiber.Type>} type
   * @returns {boolean}
   */
  matches: function(arg, type) {
    if ($isStr(type)) type = $get(Fiber.Types, type);
    return $fn.multi(arg, function(one) {
      return $fn.types.matchesType(one, type) && $fn.types.matchesSignature(one, type);
    }, 'fn.constant', 'every');
  },

  /**
   * Determines type of `arg`
   * @param {*} arg
   * @returns {string}
   */
  what: function(arg) {
    for (var name in Fiber.Types) if ($fn.types.matches(arg, Fiber.Types[name])) return name;
    return new Fiber.Type({
      type: $fn.types.parseType(arg),
      signature: $fn.types.parseSignature(arg),
      example: $fn.constant(arg)
    });
  },

  /**
   * Returns transformed result of typeof call on `arg`.
   * @param {*} arg
   * @param {boolean} [transform=false]
   * @returns {string}
   */
  parseType: function(arg, transform) {
    return $parseType(arg, transform);
  },

  /**
   * Returns transformed result of `toString` call on `arg`.
   * @param {*} arg
   * @param {boolean} [transform=false]
   * @returns {string}
   */
  parseSignature: function(arg, transform) {
    return $parseSignature(arg, transform);
  }
};
