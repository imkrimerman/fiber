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
    properties: {
      isDeepProp: /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      isPlainProp: /^\w*$/,
      propName: /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g,
    },
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
    if (_.isString(regExp)) regExp = new RegExp(regExp);
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
      re = $fn.get($fn.regexp.map, regExpOrPath);
      if (! re) re = new RegExp(re);
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
    var re = $fn.get($fn.regexp.map, path);
    if (re) return $fn.regexp.test(string, re);
    return true;
  }
};
