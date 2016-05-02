/**
 * Injection Support
 * @type {Object}
 */
Fiber.fn.injection = {

  /**
   * Private configuration
   * @type {Object}
   */
  __private: {

    /**
     * Private key name
     * @type {string}
     */
    key: '__injection',

    /**
     * Allowed list of types that can be used for injection
     * @type {Array}
     */
    allowedTypes: ['Function'],

    /**
     * Regular expressions used for arguments injection
     * @type {Object}
     */
    regex: {
      ARGS: /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
      ARG_SPLIT: /,/,
      ARG: /^\s*(_?)(\S+?)\1\s*$/,
      STRIP_COMMENTS: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
    }
  },

  /**
   * Returns injection holder or part of it retrieved by `key`
   * @param {Function} fn
   * @param {?string} [key]
   * @returns {Object|Array}
   */
  get: function(fn, key) {
    var injectKey = $private($fn.injection, 'key');
    if (! $fn.injection.has(fn)) return [];
    if (! key) return fn[injectKey];
    if (_.has(fn[injectKey], key)) return fn[injectKey][key];
    return [];
  },

  /**
   * Determines if given function has injection
   * @param {Function} fn
   * @returns {}
   */
  has: function(fn) {
    if (! $fn.injection.isOneOfAllowed(fn)) return false;
    return _.has(fn, $private($fn.injection, 'key'));
  },

  /**
   * Injects dependencies into the function
   * @param {Function} fn
   * @param {?Array|Arguments} [args]
   * @returns {*}
   */
  inject: function(fn) {
    var resolved = [];
    if (! $fn.injection.isOneOfAllowed(fn)) return fn;
    if (! $fn.injection.has(fn)) resolved = $fn.injection.resolve(fn);

    fn[$private($fn.injection, 'key')] = {
      dependencies: resolved,
      resolved: Fiber.make(resolved).map(function(one) {
        return one instanceof Fiber.Extension ? one.getCodeCapsule() : one;
      })
    };

    fn.getInject = _.bind($fn.injection.get, this, fn);
    fn.applyInject = _.bind($fn.injection.apply, this, fn);

    return fn;
  },

  /**
   * Applies injection to the function
   * @param {Function} fn
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
   * @param {Function} fn
   * @returns {Array}
   */
  resolve: function(fn) {
    if ($fn.injection.has(fn)) return [];

    var parsed = $fn.injection.parseArguments(fn)
      , resolved = [];

    for (var i = 0; i < parsed.length; i ++) {
      parsed[i].replace($private($fn.injection, 'regex.ARG'), function(a, b, name) {
        if (_.isString(name) && _.startsWith(name, '$', 0)) name = name.slice(1, name.length);
        resolved.push(name);
      });
    }

    return resolved;
  },

  /**
   * Parses arguments names of the given function
   * @param {Function} fn
   * @returns {Array}
   */
  parseArguments: function(fn) {
    var regex = $private($fn.injection, 'regex');
    if (! _.isFunction(fn)) return [];
    return fn.toString()
      .replace(regex.STRIP_COMMENTS, '')
      .match(regex.ARGS)[1]
      .split(regex.ARG_SPLIT);
  },

  /**
   * Determines if value is one of allowed types
   * @param {*} value
   * @returns {boolean}
   */
  isOneOfAllowed: function(value) {
    return _.any($private($fn.injection, 'allowedTypes'), function(type) {
      return _['is' + _.capitalize(type)](value);
    });
  },

};
