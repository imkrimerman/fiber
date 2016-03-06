/**
 * Fiber support function
 * @var {Object}
 */
Fiber.fn = {

  /**
   * List of properties to exclude when mixin functions to Class prototype
   * @type {Array}
   */
  protoExclude: ['proto'],

  /**
   * Value that represents not defined state.
   * @type {string}
   */
  notDefined: '$__NULL__$',

  /**
   * Returns value if not undefined or null,
   * otherwise returns defaults or $__NULL__$ value
   * @see https://github.com/imkrimerman/im.val (npm version)
   * @param {*} value - value to check
   * @param {*} defaults - default value to use
   * @param {?Function} [checker] - function to call to check validity
   * @returns {*}
   */
  val: function(value, defaults, checker) {
    // if defaults not specified then assign notDefined `$__NULL__$` value
    defaults = arguments.length > 1 ? defaults : Fiber.fn.notDefined;
    // if we don't have any `value` then return `defaults`
    if (! arguments.length) return defaults;
    // if value check was made and it's not valid then return `defaults`
    if (! Fiber.fn.valCheck(value, checker)) return defaults;
    // if value not specified return defaults, otherwise return value;
    return value != null ? value : defaults;
  },

  /**
   * Checks value with the given checkers
   * @param {*} value
   * @param {Array|Function} checkers
   * @param {?string} [fn='every']
   * @returns {boolean}
   */
  valCheck: function(value, checkers, fn) {
    fn = _.isString(fn) ? fn : 'every';
    // if value and checker is specified then use it to additionally check value
    if (! _.isArray(checkers) && ! _.isFunction(checkers)) return true;
    return _[fn](_.castArray(checkers), function(check) {
      if (_.isFunction(check) && value != null) {
        // if `check` returns true then we are good
        if (check(value)) return true;
        // and return false otherwise
        return false;
      }
    });
  },

  /**
   * Merges multiple objects or arrays into one.
   * @param {Array} args - Array of objects/arrays to merge
   * @returns {Array|Object}
   */
  merge: function(array) {
    if (arguments.length > 1) array = _.toArray(arguments);
    if (! _.isArray(array)) return array;
    array = _.compact(array);
    if (Fiber.fn.isArrayOf(array, 'object'))
      return _.extend.apply(_, [{}].concat(array));
    else if (Fiber.fn.isArrayOf(array, 'array'))
      return _.flattenDeep(array);
    return array;
  },

  /**
   * Applies `method` on given `Class` with `context` and passing `args`
   * @param {Function|Object} Class - Class to call
   * @param {string} method - method to call
   * @param {?Array} [args] - arguments to pass
   * @param {?Object|Array} [context] - context to apply to
   * @returns {*}
   */
  apply: function(Class, method, args, context) {
    context = val(context, Class);
    args = val(args, []);

    var proto = Class.prototype || Class
      , method = proto && proto[method];

    if (_.isFunction(method)) return method.apply(context, _.castArray(args));
  },

  /**
   * Fires callback and event
   * @param {Function|Object} Class - Class to call
   * @param {string} event - event to fire and transform to callback name
   * @param {?Array} [eventArgs] - arguments to pass to fire method
   * @param {?Array} [cbArgs] - arguments to  pass to callback
   */
  fireCallback: function(Class, event, eventArgs, cbArgs) {
    Fiber.fn.apply(Class, _.camelCase(event.split(':').join(' ')), cbArgs);
    Fiber.fn.apply(Class, 'fire', eventArgs);
  },

  /**
   * Binds array of `mixins` or mixin to the given object `context`, also you can bind
   * each method of object mixin to context by providing the `innerApply` with true
   * @param {Array|Object|Function} mixins
   * @param {Object} thisArg
   * @param {?Array} [partials=[]]
   * @returns {Array|Object|Function}
   */
  bind: function(mixins, thisArg, partials) {
    var wasArray = _.isArray(mixins);

    function bindFn(mixin) {
      if (! _.isFunction(mixin)) return mixin;
      return _.bind.apply(_, [mixin, thisArg].concat(val(partials, [])));
    };

    mixins = _.castArray(mixins);

    for (var i = 0; i < mixins.length; i ++) {
      if (_.isPlainObject(mixins[i]) || _.isArray(mixins[i]))
        mixins[i] = Fiber.fn.transform(_.clone(mixins[i]), bindFn);
      else mixins[i] = bindFn(mixins[i]);
    }

    return wasArray ? mixins : _.first(mixins);
  },

  /**
   * Transforms object
   * @param {Object} object
   * @param {Function} iteratee
   * @returns {Object}
   */
  transform: function(object, iteratee, thisArg) {
    thisArg = val(thisArg, this);
    for (var key in object)
      object[key] = iteratee.call(thisArg, object[key], key, object);
    return object;
  },

  /**
   * Checks if given array is array with objects
   * @param {Array} array - Array to check
   * @param {string} of - String of type (object, string, array ...etc)
   * @param {?string} [method=every] Method to use to check if `every`, `any` or `some` conditions worked
   * @returns {*|boolean}
   */
  isArrayOf: function(array, of, method) {
    method = val(method, 'every', _.isString);
    return _.isArray(array) && _[method](array, _['is' + _.capitalize(of)]);
  },

  /**
   * Returns object for Class prototype. Integrates support helpers to Fiber Classes
   * @param {?Array} [exclude] - Array of properties to exclude from functions object
   * @returns {Object}
   */
  proto: function(exclude) {
    return _.omit(Fiber.fn, Fiber.fn.protoExclude.concat(val(exclude, [], _.isArray)));
  },

  /**
   * Creates include function to determine
   * @param {Array} list
   * @returns {Function}
   */
  createIncludes: function(list) {
    return function(val) {
      return _.includes(list, val);
    };
  },

};

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
Fiber.fn.val.notDefined = Fiber.fn.notDefined;

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 * @static
 */
Fiber.fn.val.isDef = function(value) {
  if (! arguments.length) return false;
  return val(value) !== Fiber.fn.notDefined;
};

/**
 * @inheritDoc
 */
var val = Fiber.fn.val;
