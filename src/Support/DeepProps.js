/**
 * Deep properties explorer
 * @type {Object}
 */
$fn.deepProps = {

  /**
   * Deep properties configuration
   * @type {Object}
   */
  rules: {
    condition: [_.isArray, _.isPlainObject],
    exclude: ['fn'],
    private: {
      allow: false,
      signature: '_'
    },
    explore: [
      {owner: Fiber, path: 'container.shared.items'},
      {owner: Fiber, path: 'container.extensions.items'},
      {owner: Fiber, path: 'Events', direct: true},
      {owner: Fiber, path: 'Model.prototype', direct: true},
      {owner: Fiber, path: 'View.prototype', direct: true},
      {owner: Fiber, path: 'Collection.prototype', direct: true},
      {owner: Fiber, path: 'CollectionView.prototype', direct: true}
    ],
  },

  /**
   * Returns list of explored deep extend properties
   * @return {Array}
   */
  explore: function(explorables, rules, comparatorFn) {
    var properties = [];
    // check arguments or set default values
    explorables = $fn.castArr($val(explorables, this.rules.explore));
    rules = $fn.castArr($val(rules, $fn.deepProps.rules.condition));
    comparatorFn = $val(comparatorFn, 'some', $fn.createIncludes(['some', 'any', 'every']));
    // traverse through explorables collection
    for (var i = 0; i < explorables.length; i ++) {
      var explorable = explorables[i]
        , holder = _.get(explorable.owner, explorable.path, {});
      // if holder is not valid then continue
      if (_.isEmpty(holder) || _.isFunction(holder) || ! _.isObject(holder)) continue;
      // if we are not exploring deeply then wrap container container into array
      if (explorable.direct) holder = [holder];
      // traverse through the holder of the properties container
      for (var key in holder) {
        var explored = $fn.deepProps.exploreInObject($fn.extensions.ensureCodeCapsule(holder[key]), rules, comparatorFn);
        // explore properties in container using rules and comparator function
        properties = properties.concat(explored);
      }
    }
    return _.uniq(properties);
  },

  /**
   * Explores deep properties in given `object`
   * @param {Object} container
   * @param {Array} rules
   * @param {string} method
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  exploreInObject: function(container, rules, method, exclude) {
    var properties = [];
    exclude = $fn.castArr($val(exclude, [], [_.isArray, _.isString]));

    if (! $fn.deepProps.rules.private.allow) $each(_.keys(container), function(key) {
      _.startsWith(key, $fn.deepProps.rules.private.signature) && exclude.push(key);
    });

    container = _.omit(container, exclude.concat($fn.deepProps.rules.exclude));

    $each(container, function(value, prop) {
      if ($fn.deepProps.validate(value, rules, method)) properties.push(prop);
    });
    return _.uniq(properties);
  },

  /**
   * Validates deep property
   * @param {*} property
   * @param {Array|Function} rules
   * @param {?string} [method]
   * @returns {boolean}
   */
  validate: function(property, rules, method) {
    if (! rules || ! property) return false;
    method = $val(method, 'every', $fn.createIncludes(['some', 'every']))
    return _[method]($fn.castArr(rules), function(rule) {
      return rule(property);
    });
  },

  /**
   * Deeply extends properties to the given `child` object
   * @param {Object} child - Child hash object to apply deep extend
   * @param {Object|Function} [parent = {}] - Class or instance to extend from
   * @param {?Array} [properties] - Properties to extend (optional), default: auto explored options
   * @returns {Object|Array|*}
   */
  handle: function(child, parent, properties) {
    if (! child) return child;
    if (! parent) parent = {};
    // if `properties` not provided or not is array, then we'll use Fiber global properties
    properties = $val(properties, $fn.deepProps.explore(), _.isArray);
    // traverse each property
    _.each(properties, function(property) {
      // check and grab `property` from `parent` object prototype
      var objProtoProp = _.has(parent.prototype, property) && parent.prototype[property];
      // if we don't have given `property` in `child` or in `parent` object prototype
      // then we'll return same `child` object
      if (! _.has(child, property) || ! objProtoProp) return child;
      // if `property` value is array then concatenate `parent` object with `child` object
      if (_.isArray(child[property])) child[property] = objProtoProp.concat(child[property]);
      // else if it's plain object then extend `child` object from `parent` object
      else if (_.isPlainObject(child[property])) child[property] = _.extend({}, child[property], objProtoProp);
    });
    return child;
  },
};
