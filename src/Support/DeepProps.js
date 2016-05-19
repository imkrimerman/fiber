/**
 * Deep properties explorer
 * @type {Object}
 */
$fn.deepProps = {

  /**
   * Deep properties configuration
   * @type {Object}
   */
  config: {
    rules: [$isArr, $isPlain],
    exclude: ['fn', '$fn'],
    private: { allow: true, signature: '_' },
    explore: [{ owner: Fiber }]
  },

  /**
   * Deeply extends properties to the given `child` object
   * @param {Object} child - Child hash object to apply deep extend
   * @param {Object|function(...)} [parent = {}] - Class or instance to extend from
   * @param {?Array} [properties] - Properties to extend (optional), default: auto explored options
   * @returns {Object|Array|*}
   */
  handle: function(child, parent, properties) {
    if (! child || ! parent) return child;
    // if `properties` not provided or not is array, then we'll use Fiber global properties
    if (! $isArr(properties)) properties = $fn.deepProps.explore(parent);
    // traverse each property
    for (var i = 0; i < properties.length; i ++) {
      var property = properties[i];
      // retrieve `property` from `parent` object prototype.
      var objProtoProp = $result(parent.prototype, property);
      // if we don't have given `property` in `child` then we'll return same `child` object
      if (! child[property] || ! objProtoProp) return child;
      // Merge properties and set them back to child.
      if (! $isFn(child[property])) child[property] = $fn.deepMerge(objProtoProp, child[property]);
      else {
        var originalFn = child[property];
        child[property] = function() {
          return $fn.merge(objProtoProp, $fn.applyFn(originalFn));
        };
      }
    }
    return child;
  },

  /**
   * Explores deep properties in the given `object`.
   * @param {Object} object
   * @param {Array} [rules]
   * @param {string} [match]
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  explore: function(object, rules, match, exclude) {
    var properties = [], config = $fn.deepProps.config;
    object = $isClass(object) ? object.prototype : object;
    exclude = $castArr($val(exclude, [], [$isArr, $isStr])).concat(config.exclude);
    if (object.deepProps) properties = $castArr($result(object.deepProps), true);
    for (var prop in object) {
      var value = object[prop];
      if ($has(exclude, prop) || ! config.private.allow && _.startsWith(prop, config.private.signature)) continue;
      if ($fn.deepProps.validate(value, rules || config.rules, match)) properties.push(prop);
    }
    return _.uniq(properties);
  },

  /**
   * Returns list of explored deep extend properties.
   * @param {Array} explorables - Array in format for example: [{ owner: Fiber, path: 'Events', direct: true }]
   * @param {Object} [rules]
   * @param {string} [match]
   * @return {Array}
   */
  globalExplore: function(explorables, rules, match) {
    var properties = [];
    // check arguments or set default values
    explorables = $castArr($val(explorables, $fn.deepProps.config.explore, $fn.deepProps.isExplorable));
    rules = $castArr($val(rules, $fn.deepProps.config.rules));
    match = $valIncludes(match, 'some');
    // traverse through explorables collection
    for (var i = 0; i < explorables.length; i ++) {
      var explorable = explorables[i]
        , holder = explorable.path && $get(explorable.owner, explorable.path, {}) || explorable.owner;
      // if holder is not valid then continue
      if (_.isEmpty(holder) || $isFn(holder) || ! $isObj(holder)) continue;
      // if we are not exploring deeply then wrap container container into array
      if (explorable.direct) holder = [holder];
      // traverse through the holder of the properties container
      for (var key in holder) {
        // explore properties in container using rules and comparator function
        properties = properties.concat($fn.deepProps.explore($fn.extensions.ensureCode(holder[key]), rules, match));
      }
    }
    return _.uniq(properties);
  },

  /**
   * Validates deep property
   * @param {*} property
   * @param {Array|function(...)} rules
   * @param {?string} [method]
   * @returns {boolean}
   */
  validate: function(property, rules, method) {
    if (! rules) return true;
    if (! property) return false;
    method = $valIncludes(method, 'some', ['some', 'any', 'every'])
    return _[method]($castArr(rules), function(rule) {
      if ($isFn(rule) && rule(property)) return true;
    });
  },

  /**
   * Determines if given `object` can be explored.
   * @param {Object} object
   * @returns {boolean}
   */
  isExplorable: function(object) {
    return $isObj(object) && $fn.multi(object, function(one) {
        return $has(one, 'owner');
      }, 'fn.constant', 'every');
  }
};
