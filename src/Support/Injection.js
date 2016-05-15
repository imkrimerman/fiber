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
   * @param {function(...)} fn
   * @param {?string} [key]
   * @returns {Object|Array}
   */
  get: function(fn, key) {
    if (! $fn.injection.has(fn)) return [];
    if (! key) return fn[$propNames.injection];
    var joinedKey = $fn.join([$propNames.injection, key], '.');
    if ($fn.has(fn, joinedKey)) return $fn.get(fn, joinedKey);
    return [];
  },

  /**
   * Determines if given function has injection
   * @param {function(...)} fn
   * @returns {}
   */
  has: function(fn) {
    if (! $fn.injection.isOneOfAllowed(fn)) return false;
    return $fn.has(fn, $propNames.injection);
  },

  /**
   * Injects dependencies into the function
   * @param {function(...)} fn
   * @param {?Array|Arguments} [args]
   * @returns {function(...)}
   */
  inject: function(fn) {
    var resolved = [];
    if (! $fn.injection.isOneOfAllowed(fn)) return fn;
    if (! $fn.injection.has(fn)) resolved = $fn.injection.resolve(fn);

    fn[$propNames.injection] = {
      dependencies: resolved,
      resolved: Fiber.make(resolved).map(function(one) {
        return one instanceof Fiber.Extension ? one.getCode() : one;
      })
    };

    fn.injected = _.bind($fn.injection.get, this, fn);
    fn.$inject = _.bind($fn.injection.apply, this, fn);
    return fn;
  },

  /**
   * Applies injection to the function
   * @param {function(...)} fn
   * @param {Array} args
   * @returns {*}
   */
  apply: function(fn, args) {
    if (! $fn.injection.has(fn)) fn = $fn.injection.inject(fn);
    return fn.apply(fn, $fn.injection.get(fn, 'resolved').concat($val(args, [], _.isArray)));
  },

  /**
   * Prepares injection for the function
   * @param {function(...)} fn
   * @returns {Array}
   */
  resolve: function(fn) {
    if ($fn.injection.has(fn)) return [];
    var resolved = [], parsed = $fn.injection.parseArguments(fn);
    for (var i = 0; i < parsed.length; i ++) {
      parsed[i].replace($fn.regexp.map.injection.arg, function(a, b, name) {
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
    var re = $fn.regexp.map.injection;
    if (! _.isFunction(fn)) return [];
    return fn.toString()
      .replace(re.stripComments, '')
      .match(re.args)[1]
      .split(re.argsSplit);
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
