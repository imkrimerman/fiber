/**
 * Type Checker
 * @type {Object}
 */
Fiber.TypeChecker = $TypeChecker = {

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
  type: function(arg, type) {
    var argType = $TypeChecker.transform(typeof arg);
    if (! $isDef(type)) return argType;
    type = type instanceof Fiber.Type ? type.getType() : type;
    if (_.isPlainObject(type) && type.hasOwnProperty('type')) type = type.type;
    return argType === $TypeChecker.transform(type);
  },

  /**
   * Determines if arg matches type signature
   * @param {*} arg
   * @param {Object.<Fiber.Type>|string} type
   * @returns {boolean}
   */
  signature: function(arg, type) {
    var signature = $TypeChecker.transform(Object.prototype.toString.apply(arg));
    if ($isDef(type)) return signature;
    type = type instanceof Fiber.Type ? type.getSignature() : type;
    if (_.isPlainObject(type) && type.hasOwnProperty('signature')) signature = type.signature;
    return signature === $TypeChecker.transform(type);
  },

  /**
   * Returns transformed string
   * @param {string} string
   * @param {?Object} [scope]
   * @returns {string}
   */
  transform: function(string, scope) {
    return $TypeChecker.transformer.apply($val(scope, null), $fn.castArr(string));
  },

  /**
   * Determines if arg is matches type
   * @param {*} arg
   * @param {string|Object.<Fiber.Type>} type
   * @param {?boolean} [oneArg=false]
   * @returns {boolean}
   */
  matches: function(arg, type, oneArg) {
    type = _.isString(type) ? $Types[type] : type;
    var check = function(one) {return $TypeChecker.type(one, type) && $TypeChecker.signature(one, type);};
    if (oneArg) return check(arg, type);
    return $fn.multi(arg, check, null, 'every');
  },
};
