/**
 * Deep properties explorer
 * @type {Object}
 */
fn.deepProps = {

  /**
   * Deep properties configuration
   * @type {Object}
   */
  rules: {
    condition: [_.isArray, _.isPlainObject],
    exclude: ['fn'],
    explore: [
      {owner: Fiber, path: 'container.binding.items'},
      {owner: Fiber, path: 'container.extensions.items'},
      {owner: Fiber, path: 'Events', direct: true},
      {owner: Fiber, path: 'Model.prototype', direct: true},
      {owner: Fiber, path: 'View.prototype', direct: true},
      {owner: Fiber, path: 'CollectionView.prototype', direct: true}
    ],
  },

  // todo: maybe we'll go with hardcoded default props
  /**
   * Cached deep properties
   * @type {Array}
   */
  __props: [],

  /**
   * Cached deep properties getter
   * @returns {Array}
   */
  get props() {
    return this.__props;
  },

  /**
   * Cached deep properties setter
   * @param {Array|string} list
   */
  set props(list) {
    this.__props = fn.concat(this.__props, list);
  },

  /**
   * Returns list of explored deep extend properties
   * @return {Array}
   */
  explore: function(explorables, rules, comparatorFn) {
    var properties = [];
    // check arguments or set default values
    explorables = _.castArray(val(explorables, this.rules.explore));
    rules = _.castArray(val(rules, fn.deepProps.rules.condition));
    comparatorFn = val(comparatorFn, 'some', fn.createIncludes(['some', 'any']));
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
        var explored = fn.deepProps.exploreInObject(
          fn.extensions.mapCall(holder[key], 'getCodeCapsule', true), rules, comparatorFn
        );
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
   * @param {string} fn
   * @param {Array|string} [exclude]
   * @returns {Array}
   */
  exploreInObject: function(container, rules, fn, exclude) {
    var properties = [];
    exclude = _.castArray(val(exclude, [], [_.isArray, _.isString]));
    _.each(_.keys(container), function(key) { key[0] === '_' && key[1] === '_' && exclude.push(key); });
    container = _.omit(container, exclude.concat(fn.deepProps.rules.exclude));
    _.each(container, function(value, prop) {
      if (fn.deepProps.validate(value, rules, fn)) properties.push(prop);
    });
    return _.uniq(properties);
  },

  /**
   * Validates deep property
   * @param {*} property
   * @param {Array|Function} rules
   * @param {?string} [fn]
   * @returns {boolean}
   */
  validate: function(property, rules, fn) {
    if (! rules || ! property) return false;
    fn = val(fn, 'every', fn.createIncludes(['some', 'every']))
    return _[fn](_.castArray(rules), function(rule) {
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
    properties = val(properties, fn.deepProps.explore(), _.isArray);
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
