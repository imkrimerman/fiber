/**
 * RegExp Support
 * @type {Object}
 */
Fiber.fn.regexp = {

  /**
   * Regular expression map
   * @type {Object}
   */
  map: {
    isFunction: /function\s*([A-z0-9]+)?\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*\{(?:[^}{]+|\{(?:[^}{]+|\{[^}{]*\})*\})*\}/,
    isFunctionEmpty: /function\s*\w*\s*\(.*?\)\s*{\s*}\s*;?\s*/,
    injection: {
      args: /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
      argsSplit: /,/,
      arg: /^\s*(_?)(\S+?)\1\s*$/,
      stripComments: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
    }
  },

  /**
   * Tests `string` with the given regular expression
   * @param {string} string
   * @param {string|RegExp} path
   * @returns {boolean}
   */
  test: function(string, regExp) {
    if (_.isString(regExp)) regExp = $fn.regexp.$new(regExp);
    if (! _.isRegExp(regExp)) return true;
    return regExp.test($fn.cast.toString(string));
  },

  /**
   * Executes regular expression on the string.
   * @param {string} string
   * @param {string|RegExp} regExpOrPath
   * @returns {Array}
   */
  exec: function(string, regExpOrPath) {
    var re = regExpOrPath;
    if (_.isString(regExpOrPath)) {
      re = $get($fn.regexp.map, regExpOrPath);
      if (! re) re = $fn.regexp.$new(re);
    }
    if (! _.isRegExp(re)) return [];
    return regExpOrPath.exec(string) || [];
  },

  /**
   * Tests `string` with predefined in map regular expression using `path`
   * @param {string} string
   * @param {string} path
   * @returns {boolean}
   */
  matches: function(string, path) {
    var re = $get($fn.regexp.map, path);
    if (re) return $fn.regexp.test(string, re);
    return true;
  },

  /**
   * Returns string with all characters escaped that have special meaning in a regular expression.
   * @param {string} string
   * @returns {string}
   */
  escape: function(string) {
    return (_.isRegExp(string) && string) || $fn.cast.toString(string).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  },

  /**
   * Creates new regular expression from string, also escapes it before construction.
   * @param {string} string
   * @returns {RegExp}
   */
  $new: function(string) {
    return new RegExp($fn.regexp.escape(string));
  },
};
