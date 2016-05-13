/**
 * Injection Support
 * @type {Object}
 */
Fiber.fn.injection = {

  /**
   * Allowed list of types that can be used for injection
   * @type {Array}
   */
  allowedTypes: ['Function'],

  /**
   * Retrieves injection container or part of it by the `key`
   * @param {function()} fn
   * @param {?string} [key]
   * @returns {Object|Array}
   */
  get: function(fn, key) {
    if (! $fn.injection.has(fn)) return [];
    if (! key) return fn[$PropNames.injection];
    var joinedKey = $fn.join([$PropNames.injection, key], '.');
    if ($fn.has(fn, joinedKey)) return $fn.get(fn, joinedKey);
    return [];
  },

  /**
   * Determines if given function has injection
   * @param {function()} fn
   * @returns {}
   */
  has: function(fn) {
    if (! $fn.injection.isOneOfAllowed(fn)) return false;
    return $fn.has(fn, $PropNames.injection);
  },

  /**
   * Injects dependencies into the function
   * @param {function()} fn
   * @param {?Array|Arguments} [args]
   * @returns {function()}
   */
  inject: function(fn) {
    var resolved = [];
    if (! $fn.injection.isOneOfAllowed(fn)) return fn;
    if (! $fn.injection.has(fn)) resolved = $fn.injection.resolve(fn);

    fn[$PropNames.injection] = {
      dependencies: resolved,
      resolved: Fiber.make(resolved).map(function(one) {
        return one instanceof Fiber.Extension ? one.getCode() : one;
      })
    };

    fn.getInject = _.bind($fn.injection.get, this, fn);
    fn.applyInject = _.bind($fn.injection.apply, this, fn);
    return fn;
  },

  /**
   * Applies injection to the function
   * @param {function()} fn
   * @param {Array} args
   * @returns {*}
   */
  apply: function(fn, args) {
    if (! $fn.injection.has(fn)) fn = $fn.injection.inject(fn);
    args = $fn.injection.get(fn, 'resolved').concat($val(args, [], _.isArray))
    return fn.apply(fn, args);
  },

  /**
   * Prepares injection for the function
   * @param {function()} fn
   * @returns {Array}
   */
  resolve: function(fn) {
    if ($fn.injection.has(fn)) return [];
    var parsed = $fn.injection.parseArguments(fn), resolved = [];
    for (var i = 0; i < parsed.length; i ++) {
      parsed[i].replace($fn.regexp.injection.arg, function(a, b, name) {
        if (_.isString(name) && _.startsWith(name, '$', 0)) name = name.slice(1, name.length);
        resolved.push(name);
      });
    }
    return resolved;
  },

  /**
   * Parses arguments names of the given function
   * @param {Object} fn
   * @returns {Array}
   */
  parseArguments: function(fn) {
    var regex = $fn.regexp.injection;
    if (! _.isFunction(fn)) return [];
    return fn.toString()
      .replace(regex.stripComments, '')
      .match(regex.args)[1]
      .split(regex.argsSplit);
  },

  /**
   * Determines if value is one of allowed types
   * @param {*} value
   * @returns {boolean}
   */
  isOneOfAllowed: function(value) {
    return _.any($fn.injection.allowedTypes, function(type) {
      return _['is' + _.capitalize(type)](value);
    });
  }
};
