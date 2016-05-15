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
    rules: [_.isArray, _.isPlainObject],
    exclude: ['fn', '$fn'],
    private: { allow: true, signature: '_' },
    explore: [
      { owner: Fiber, path: 'container.shared.items' },
      { owner: Fiber, path: 'container.bindings.items' },
      { owner: Fiber, path: 'container.extensions.items' },
      { owner: Fiber, path: 'Events', direct: true },
      { owner: Fiber, path: 'Monitor', direct: true },
      { owner: Fiber, path: 'Application', direct: true },
      { owner: Fiber, path: 'Model.prototype', direct: true },
      { owner: Fiber, path: 'View.prototype', direct: true },
      { owner: Fiber, path: 'Collection.prototype', direct: true },
      { owner: Fiber, path: 'CollectionView.prototype', direct: true }
    ],
  },

  /**
   * Deeply extends properties to the given `child` object
   * @param {Object} child - Child hash object to apply deep extend
   * @param {Object|function()} [parent = {}] - Class or instance to extend from
   * @param {?Array} [properties] - Properties to extend (optional), default: auto explored options
   * @returns {Object|Array|*}
   */
  handle: function(child, parent, properties) {
    if (! child) return child;
    if (! parent) parent = {};
    // if `properties` not provided or not is array, then we'll use Fiber global properties
    if (! _.isArray(properties)) properties = $fn.deepProps.explore();
    // traverse each property
    _.each(properties, function(property) {
      // check and grab `property` from `parent` object prototype
      var objProtoProp = $fn.has(parent.prototype, property) && parent.prototype[property];
      if (_.isFunction(objProtoProp)) objProtoProp = $fn.applyFn(objProtoProp, [], parent.prototype);
      // if we don't have given `property` in `child` or in `parent` object prototype
      // then we'll return same `child` object
      if (! $fn.has(child, property) || ! objProtoProp) return child;
      // if `property` value is array then concatenate `parent` object with `child` object
      if (_.isArray(child[property])) child[property] = objProtoProp.concat(child[property]);
      // else if it's plain object then extend `child` object from `parent` object
      else if (_.isPlainObject(child[property])) child[property] = _.extend({}, child[property], objProtoProp);
    });
    return child;
  },

  /**
   * Returns list of explored deep extend properties
   * @return {Array}
   */
  explore: function(explorables, rules, comparatorFn) {
    var properties = [];
    // check arguments or set default values
    explorables = $fn.castArr($val(explorables, this.rules.explore, $fn.deepProps.isExplorable));
    rules = $fn.castArr($val(rules, $fn.deepProps.config.rules));
    comparatorFn = $valIncludes(comparatorFn, 'some');
    // traverse through explorables collection
    for (var i = 0; i < explorables.length; i ++) {
      var explorable = explorables[i]
        , holder = $fn.get(explorable.owner, explorable.path, {});
      // if holder is not valid then continue
      if (_.isEmpty(holder) || _.isFunction(holder) || ! _.isObject(holder)) continue;
      // if we are not exploring deeply then wrap container container into array
      if (explorable.direct) holder = [holder];
      // traverse through the holder of the properties container
      for (var key in holder) {
        var explored = $fn.deepProps.exploreInObject($fn.extensions.ensureCode(holder[key]), rules, comparatorFn);
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
    container = _.omit(container, exclude.concat($fn.deepProps.config.exclude));
    $each(container, function(value, prop) {
      if (! $fn.deepProps.config.private.allow && _.startsWith(prop, $fn.deepProps.config.private.signature)) return;
      if ($fn.deepProps.validate(value, rules, method)) properties.push(prop);
    });
    return _.uniq(properties);
  },

  /**
   * Validates deep property
   * @param {*} property
   * @param {Array|function()} rules
   * @param {?string} [method]
   * @returns {boolean}
   */
  validate: function(property, rules, method) {
    if (! rules) return true;
    if (! property) return false;
    method = $valIncludes(method, 'every', ['some', 'any', 'every'])
    return _[method]($fn.castArr(rules), function(rule) {
      return _.isFunction(rule) && rule(property) || true;
    });
  },

  /**
   * Determines if given `object` can be explored.
   * @param {Object} object
   * @returns {boolean}
   */
  isExplorable: function(object) {
    return _.isObject(object) && $fn.multi(object, function(one) {
        return $fn.hasAllProps(one, ['owner']);
      }, 'fn.constant', 'every');
  }
};
