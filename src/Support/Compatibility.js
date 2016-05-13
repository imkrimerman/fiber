/**
 * Cached Backbone Events trigger method
 * @type {function()}
 */
$trigger = Backbone.Events.trigger;

/**
 * Wraps Backbone Events trigger method to give ability to listen to global events.
 * @param {string} name
 * @param {...args}
 * @returns {Backbone}
 */
Backbone.Events.trigger = function(name) {
  var args = $fn.cast.toArray(arguments);
  $trigger.apply(Fiber.internal.events, args);
  $trigger.apply(this, arguments);
  return this;
};

/**
 * Cache lodash `each` method to use in backward compatibility mode for the previous lodash versions
 * @type {_.each|*|(function((Array|Object), function()=): (Array|Object))}
 */
$origEach = _.bind(_.each, _);

/**
 * Adds compatibility for `each` method
 * @param {Array|Object} collection
 * @param {function()} iteratee
 * @param {?Object} [scope]
 * @returns {*}
 */
$each = function(collection, iteratee, scope) {
  if (scope) iteratee = _.bind(iteratee, scope);
  return $origEach(collection, iteratee);
};

/**
 * Internal function that returns an efficient (for current engines) version
 * of the passed-in callback, to be repeatedly applied in other Underscore
 * functions.
 * @param {function()} func
 * @param {?Object} [context]
 * @param {?number} [argCount]
 * @returns {*}
 */
var $optimizeCb = function(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1:
      return function(value) {
        return func.call(context, value);
      };
    // The 2-parameter case has been omitted only because no current consumers
    // made use of it.
    case 3:
      return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
    case 4:
      return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
  }
  return function() {
    return func.apply(context, arguments);
  };
};

/**
 * An Internal function to generate callbacks that can be applied to each
 * element in a collection, returning the desired result — either `identity`,
 * an arbitrary callback, a property matcher, or a property accessor.
 * @param {string|function()|Object} value
 * @param {?Object} [scope]
 * @param {?number} [argCount]
 * @returns {function()}
 */
var $iterateeCb = function(value, scope, argCount) {
  if (_.iteratee !== $iteratee) return _.iteratee(value, scope);
  if (value == null) return _.identity;
  if (_.isFunction(value)) return $optimizeCb(value, scope, argCount);
  if (_.isObject(value)) return _.matcher(value);
  return _.property(value);
};

/**
 * External wrapper for our callback generator. Users may customize
 * `_.iteratee` if they want additional predicate/iteratee shorthand styles.
 * This abstraction hides the Internal-only argCount argument.
 * @param {string|function()|Object} value
 * @param {?Object} [scope]
 * @returns {function()}
 */
$iteratee = function(value, scope) {
  return $iterateeCb(value, scope, Infinity);
};

/**
 * Returns a predicate for checking whether an object has a given set of
 * `key:value` pairs.
 * @param {Object} attributes
 * @returns {function()}
 */
$matches = function(attributes) {
  return function(object) {
    return _.isMatch(object, _.extend({}, attributes));
  };
};

/**
 * Add `lodash` mixins
 */
_.mixin({
  any: _.some,
  contains: _.includes,
  each: $each,
  forEach: $each,
  iteratee: $iteratee,
  matches: $matches,
  matcher: $matches
});

/**
 * Adds `Function.bind` polyfill if function is not exists. Used to support `bind` in PhantomJS.
 */
if (! Function.prototype.bind) {

  /**
   * The bind function is an addition to ECMA-262, 5th edition; as such it may not be present in all browsers.
   * You can partially work around this by inserting the following code at the beginning of your scripts,
   * allowing use of much of the functionality of bind() in implementations that do not natively support it.
   * @param {Object} scope
   * @param {...args}
   * @returns {bound}
   */
  Function.prototype.bind = function(scope) {
    if (typeof this !== 'function') throw new TypeError('function().prototype.bind - ' +
                                                        'what is trying to be bound is not callable');
    var args = Array.prototype.slice.call(arguments, 1)
      , partials = Array.prototype.slice.call(arguments)
      , fn = this
      , noop = function() {}
      , bound = function() {
      return fn.apply(this instanceof noop && scope ? this : scope, args.concat(partials));
    };

    noop.prototype = this.prototype;
    bound.prototype = new noop();
    return bound;
  };
}
