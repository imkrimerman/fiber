/**
 * Fiber String support
 * @var {Object}
 * @memberof Fiber.fn#
 */
Fiber.fn.string = {

  /**
   * Converts first letter of the string to uppercase.
   * If true is passed as second argument the rest of the string will be converted to lower case.
   *
   * capitalize("FOO Bar", true);
   // => "Foo bar"
   *
   * @param {String} str - String to capitalize
   * @param {Boolean} lowercaseRest - makes lower case all letters except first
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  capitalize: function(str, lowercaseRest) {
    str = makeString(str);
    return str.charAt(0).toUpperCase() + ((! lowercaseRest) ? str.slice(1) : str.slice(1).toLowerCase());
  },

  /**
   * Converts first letter of the string to lowercase.
   *
   * decapitalize("Foo Bar");
   * // => "foo Bar"
   *
   * @param {String} str - String to decapitalize
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  decapitalize: function (str) {
    str = makeString(str);
    return str.charAt(0).toLowerCase() + str.slice(1);
  },

  /**
   * Converts string to title case style 'Code style'
   *
   * titleize("my name is john");
   * // => "My Name Is John"
   *
   * @param {String} str
   * @returns {string}
   * @memberof Fiber.fn.string#
   */
  titleize: function(str) {
    return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
      return c.toUpperCase();
    });
  },

  /**
   * Converts underscored or dasherized string to a camelized one.
   * Begins with a lower case letter unless it starts with an underscore, dash or an upper case letter.
   *
   * camelize("moz-transform");
   * // => "mozTransform"
   *
   * @param {String} str
   * @param {Boolean} decapitalize
   * @returns {*}
   * @memberof Fiber.fn.string#
   */
  camelize: function(str, decapitalize) {
    str = this.trim(str).replace(/[-_\s]+(.)?/g, function(match, c) {
      return c ? c.toUpperCase() : "";
    });

    return decapitalize === true ? this.decapitalize(str) : str;
  },

  /**
   * Converts a underscored or camelized string into an dasherized one
   *
   * dasherize("MozTransform");
   * // => "-moz-transform"
   *
   * @param {String} str
   * @returns {string}
   * @memberof Fiber.fn.string#
   */
  dasherize: function(str) {
    return this.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
  },

  /**
   * Converts a camelized or dasherized string into an underscored one
   *
   * underscored("MozTransform");
   * // => "moz_transform"
   *
   * @param {String} str
   * @returns {string}
   * @memberof Fiber.fn.string#
   */
  underscored: function(str) {
    return this.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
  },

  /**
   * Converts an underscored, camelized, or dasherized string into a humanized one.
   * Also removes beginning and ending whitespace, and removes the postfix '_id'.
   *
   * humanize("  capitalize dash-CamelCase_underscore trim  ");
   * // => "Capitalize dash camel case underscore trim"
   *
   * @param {String} str
   * @returns {*|String}
   * @memberof Fiber.fn.string#
   */
  humanize: function(str) {
    return this.capitalize(this.trim(this.underscored(str).replace(/_id$/, '').replace(/_/g, ' ')));
  },

  /**
   * Checks if string starts at position (default: 0)
   *
   * startsWith("image.gif", "image");
   * // => true
   *
   * @param {String} str
   * @param {String} starts
   * @param {Number} position
   * @returns {boolean}
   * @memberof Fiber.fn.string#
   */
  startsWith: function (str, starts, position) {
    str = makeString(str);
    starts = '' + starts;
    position = position == null ? 0 : Math.min(toPositive(position), str.length);
    return str.lastIndexOf(starts, position) === position;
  },

  /**
   * Checks if string ends at position (default: string.length)
   *
   * endsWith("image.gif", "gif");
   * // => true
   *
   * @param {String} str
   * @param {String} ends
   * @param {Number} position
   * @returns {boolean}
   * @memberof Fiber.fn.string#
   */
  endsWith: function(str, ends, position) {
    str = makeString(str);
    ends = '' + ends;
    if (typeof position == 'undefined') {
      position = str.length - ends.length;
    } else {
      position = Math.min(toPositive(position), str.length) - ends.length;
    }
    return position >= 0 && str.indexOf(ends, position) === position;
  },

  /**
   * Removes trailing slash from string
   *
   * removeTrailingSlash("foobar/");
   * // => "foobar"
   *
   * @param {String} str
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  removeTrailingSlash: function(str) {
    str = makeString(str);
    if (this.endsWith(str, '/')) str = str.slice(0, -1);
    return str;
  },

  /**
   * Joins array of string paths into one path
   *
   * joinPath(["foobar/", "baz/"]);
   * // => "foobar/baz"
   *
   * @param {String} str
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  joinPath: function(paths) {
    paths = _.compact(paths);
    if (! _.isArray(paths)) paths = [paths];
    if (_.isEmpty(paths)) return '';
    var pathStack = [];
    for (var i = 0; i < paths.length; i++) {
      var path = this.clean(paths[i]);
      if (i !== 0) path = this.trim(path, '/');
      else path = this.removeTrailingSlash(path);
      pathStack.push(path);
    }
    return pathStack.join('/');
  },

  /**
   * Trims defined characters from begining and ending of the string. Defaults to whitespace characters.
   *
   * trim("  foobar   ");
   * // => "foobar"
   *
   * trim("_-foobar-_", "_-");
   * // => "foobar"
   *
   * @param {String} str
   * @param {String} [chars]
   * @returns {*}
   * @memberof Fiber.fn.string#
   */
  trim: function(str, chars) {
    str = makeString(str);
    if (! chars && nativeTrim) return nativeTrim.call(str);
    chars = defaultToWhiteSpaces(chars);
    return str.replace(new RegExp('^' + chars + '+|' + chars + '+$', 'g'), '');
  },

  /**
   * Trims all defined characters from beginning and ending of the string. Defaults to whitespace characters.
   * @param {Array|Object|String} strings
   * @param {String} [chars]
   * @returns {*}
   * @memberof Fiber.fn.string#
   */
  trimAll: function(strings, chars) {
    if (_.isString(strings)) return this.trim(strings, chars);
    if (_.isObject(strings)) strings = _.values(strings);
    if (_.isArray(strings)) {
      strings = _.map(strings, function(string) {
        return this.trim(string, chars);
      }.bind(this));
    }
    return strings;
  },

  /**
   * Tests if string contains a needle.
   *
   * has("foobar", "ob");
   * // => true
   *
   * @param {String} str
   * @param {String} needle
   * @returns {Boolean}
   * @memberof Fiber.fn.string#
   */
  has: function(str, needle) {
    if (needle === '') return true;
    return makeString(str).indexOf(needle) !== -1;
  },

  /**
   * Replaces `needle` in `string` with given `replace` (default: '') if condition returns true
   * @param {String} str
   * @param {String} needle
   * @param {Function} condition
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  replaceIf: function(str, needle, replace, condition) {
    if (! this.has(str, needle)) return str;
    if (condition(str, needle, replace))
      return str.replace(needle, replace);
    return str;
  },

  /**
   * Removes all html tags from string.
   *
   * stripTags("a <a href=\"#\">link</a>");
   * // => "a link"
   *
   * @param {String} str
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  stripTags: function(str) {
    return makeString(str).replace(/<\/?[^>]+>/g, '');
  },

  /**
   * Trims and replaces multiple spaces with a single space.
   *
   * clean(" foo    bar   ");
   * // => "foo bar"
   *
   * @param {String} str
   * @returns {String}
   * @memberof Fiber.fn.string#
   */
  clean: function(str) {
    return this.trim(str).replace(/\s\s+/g, ' ');
  },

  /**
   * Parses string to number. Returns NaN if string can't be parsed to number.
   *
   * toNumber("2.556");
   * // => 3
   *
   * toNumber("2.556", 1);
   * // => 2.6
   *
   * @param {String} str
   * @param {Number} precision
   * @returns {Number|NaN}
   * @memberof Fiber.fn.string#
   */
  toNumber: function(num, precision) {
    if (num == null) return 0;
    var factor = Math.pow(10, isFinite(precision) ? precision : 0);
    return Math.round(num * factor) / factor;
  },

  /**
   * Turns strings that can be commonly considered as booleas to real booleans.
   * Such as "true", "false", "1" and "0". This function is case insensitive.
   *
   * toBoolean("true");
   * // => true
   *
   * It can be customized by giving arrays of truth and falsy value matcher as parameters.
   * Matchers can be also RegExp objects.
   *
   * toBoolean("true only at start", [/^true/]);
   * // => true
   *
   * @param {String} str
   * @returns {Boolean}
   * @memberof Fiber.fn.string#
   */
  toBoolean: function(str, trueValues, falseValues) {
    if (typeof str === "number") str = "" + str;
    if (typeof str !== "string") return !!str;
    str = this.trim(str);
    if (boolMatch(str, trueValues || ["true", "1"])) return true;
    if (boolMatch(str, falseValues || ["false", "0"])) return false;
  },

};

/**
 * Makes string
 * @param {*} obj
 * @returns {string}
 */
var makeString = function(obj) {
  if (obj == null) return '';
  return '' + obj;
};

/**
 * If number less then 0 then set to zero and type cast to Number
 * @param {Number} number
 * @returns {number}
 */
var toPositive = function(number) {
  return number < 0 ? 0 : (+number || 0);
};

/**
 * Escapes string special symbols to use in RegExp
 * @param {String} str
 * @returns {*}
 */
var escapeRegExp = function(str) {
  return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/**
 * Converts string of chars for RegExp format
 * @param {*} chars
 * @returns {*}
 */
var defaultToWhiteSpaces = function(chars) {
  if (chars == null)
    return '\\s';
  else if (chars.source)
    return chars.source;
  else
    return '[' + escapeRegExp(chars) + ']';
};

/**
 * Checks if string matches to given bool values
 * @param {String} str
 * @param {Array} matchers
 * @returns {boolean}
 */
var boolMatch = function(str, matchers) {
  var i, matcher, down = str.toLowerCase();
  matchers = [].concat(matchers);
  for (i = 0; i < matchers.length; i += 1) {
    matcher = matchers[i];
    if (! matcher) continue;
    if (matcher.test && matcher.test(str)) return true;
    if (matcher.toLowerCase() === down) return true;
  }
};

/**
 * JS native trim function
 * @var {Function}
 */
var nativeTrim = String.prototype.trim;
