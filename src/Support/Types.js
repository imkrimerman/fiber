/**
 * Type Checker
 * @type {Object}
 */
Fiber.fn.types = {

  /**
   * Keys to look up if Type is plain object
   * @type {Object}
   */
  lookUpKeys: {
    type: 'type',
    signature: 'signature'
  },

  /**
   * Function to apply same transformation before check
   * @type {Function}
   */
  transformer: String.prototype.toLowerCase,

  /**
   * Determines if arg matches typeof conversion
   * @param {*} arg
   * @param {Object.<Fiber.Type>|string} type
   * @returns {boolean}
   */
  matchesType: function(arg, type) {
    var argType = $fn.types.transform(typeof arg);
    if (! $isDef(type)) return argType;
    type = type instanceof Fiber.Type ? type.getType() : type;
    if (_.isPlainObject(type) && $fn.has(type, $fn.lookUpKeys.type))
      type = $fn.get(type, $fn.lookUpKeys.type);
    return argType === $fn.types.transform(type);
  },

  /**
   * Determines if arg matches type signature
   * @param {*} arg
   * @param {Object.<Fiber.Type>|string} type
   * @returns {boolean}
   */
  matchesSignature: function(arg, type) {
    var signature = $fn.types.transform(Object.prototype.toString.apply(arg));
    if ($isDef(type)) return signature;
    type = type instanceof Fiber.Type ? type.getSignature() : type;
    if (_.isPlainObject(type) && $fn.has(type, $fn.lookUpKeys.signature))
      signature = $fn.get(type, $fn.lookUpKeys.signature);
    return signature === $fn.types.transform(type);
  },

  /**
   * Returns transformed string
   * @param {string} string
   * @param {?Object} [scope]
   * @returns {string}
   */
  transform: function(string, scope) {
    return $fn.types.transformer.apply($val(scope, null), $fn.castArr(string));
  },

  /**
   * Determines if arg is matches the type
   * @param {*} arg
   * @param {string|Object.<Fiber.Type>} type
   * @param {?boolean} [oneArg=false]
   * @returns {boolean}
   */
  matches: function(arg, type, oneArg) {
    type = _.isString(type) && Fiber.Types ? Fiber.Types[type] : type;
    if (oneArg || ! _.isArray(arg)) return this.__matches(arg, type);
    return $fn.multi(arg, this.__matches, null, 'every', this);
  },

  /**
   * Determines if one arg is matches the type
   * @param {*} arg
   * @param {string|Object.<Fiber.Type>} type
   * @returns {boolean}
   * @private
   */
  __matches: function(arg, type) {
    return $fn.types.matchesType(arg, type) && $fn.types.matchesSignature(arg, type);
  },
};
