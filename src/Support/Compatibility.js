/**
 * Cache lodash `each` method to use in backward compatibility mode for the previous lodash versions
 * @type {_.each|*|(function((Array|Object), Function=): (Array|Object))}
 */
$each = _.each;

/**
 * Adds backward compatibility for lodash `each` method
 * @param {Array|Object} collection
 * @param {Function} iteratee
 * @param {?Object} [scope]
 * @returns {*}
 */
var forEach = function(collection, iteratee, scope) {
  if (scope) iteratee = _.bind(iteratee, scope);
  return $each(collection, iteratee);
};

/**
 * Add alias for `some` function
 */
_.mixin({
  any: _.some,
  contains: _.includes,
  each: forEach,
  forEach: forEach
});
