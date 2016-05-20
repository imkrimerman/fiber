/**
 * Serialize support
 * @type {Object}
 */
Fiber.fn.serialize = {

  /**
   * Serializer configuration
   * @type {Object}
   */
  config: {
    serializer: JSON,
    methods: {
      parse: 'parse',
      stringify: 'stringify'
    }
  },

  /**
   * Parses string representation of object to actual object.
   * @param {string} string
   * @param {boolean} deep
   * @returns {Object}
   */
  parse: function(string, deep) {
    deep = $val(deep, true);
    if (! $isStr(string)) return string;

    try { var parsed = $fn.serialize.serializer('parse', [string]); }
    catch (e) { parsed = {}; }

    if (_.isEmpty(parsed)) return parsed;
    $each(parsed, function(value, prop) {
      if (! $isStr(value)) return value;
      if ($isObj(value) && deep) return parsed[prop] = $fn.serialize.parse(value);

      value = $fn.trim(value);
      if (value[0] === '[' || value[0] === '{') return value;
      value = value.replace($fn.regexp.map.injection.stripComments, '');

      if (! $fn.regexp.matches(value, 'isFunction')) return value;
      if ($fn.regexp.matches(value, 'isFunctionEmpty')) return function() {};

      var args = $fn.injection.parseArguments(value);
      args.push($fn.trim(value.substring(value.indexOf('{') + 1, value.lastIndexOf('}'))));
      parsed[prop] = $fn.class.instance(Function, args);
    });
    return parsed;
  },

  /**
   * Serializes object to string representation.
   * @param {Object} object
   * @param {boolean} [deep=true]
   * @param {boolean} [pretty=false]
   * @returns {string}
   */
  stringify: function(object, deep, pretty) {
    if ($isFn(object)) return $fn.regexp.replace($funcToString(object), 'injection.stripComments');
    var isArray = $isArr(object), prepared = object, args = [object];

    if ($val(deep, true)) {
      prepared = isArray ? [] : {};
      args = [prepared];
      _.forOwn(object, function(value, prop) {
        if ($isObj(value)) value = $fn.serialize.stringify(value);
        isArray && prepared.push(value) || (prepared[prop] = value);
      });
    }

    if (pretty) args = args.concat([null, "\t"]);
    return $fn.serialize.serializer('stringify', args);
  },

  /**
   * Serializes object to the query parameters string.
   * @param {Object} object
   * @param {Object} [options]
   * @returns {string}
   */
  toQuery: function(object, options) {
    options = $valMerge(options, {omitMethods: true, prefixQuestionMark: false,});
    if (options.omitMethods) object = _.omit(object, $fn.methods(object));
    var prefix = options.prefixQuestionMark ? '?' : '';
    return prefix + _.map(_.toPairs(object), function(pair) {
        return _.map(pair, function(fragment) {return encodeURIComponent(fragment);}).join('=');
      }).join('&');
  },

  /**
   * Calls serializer `method` with arguments or if no arguments provided then serializer will be returned.
   * @param {string} method
   * @param {Array|Arguments} args
   * @returns {Object|string}
   */
  serializer: function(method, args) {
    if (! arguments.length) return $fn.serialize.config.serializer;
    if (! $has($fn.serialize.config.methods, method)) $log.error('Method is not available at Serializer.', method);
    return $fn.apply($fn.serialize.config.serializer, method, args);
  },
};
