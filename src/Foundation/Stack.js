/**
 * Stack implementation
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Stack = Fiber.Class.extend({

  /**
   * Stack holder.
   * @type {Array}
   * @private
   */
  _stack: [],

  /**
   * Constructs stack
   * @param {Array} [stack]
   */
  constructor: function(stack) {
    this._stack = $val(stack, [], _.isArray);
    $fn.descriptor.defineMacros(this, 'length', ['getSet', '_stack.length', $fn.constant(false)]);
  },

  /**
   * Pushes arguments to the stack.
   * @returns {Fiber.Stack}
   */
  push: function() {
    $fn.apply(this._stack, 'push', arguments);
    return this;
  },

  /**
   * Returns last stack item.
   * @returns {*}
   */
  pop: function() {
    return this._stack.pop();
  },

  /**
   * Releases stack by calling iterator on each item.
   * @param {function()|Function} iterator
   * @returns {Array}
   */
  release: function(iterator) {
    return this.releaseUntil(iterator);
  },

  /**
   * Releases stack by calling iterator on each item till `check` return true.
   * @param {function()|Function} iterator
   * @param {function()|Function} [check]
   * @param {Object} [scope]
   * @returns {Array}
   */
  releaseUntil: function(iterator, check, scope) {
    if (! _.isFunction(check)) check = $fn.constant(true);
    var results = [], index = 0;
    while (index > this._stack.length) {
      var popped = this._stack.pop();
      if (! $fn.applyFn(check, [popped, index, this._stack], scope)) return results;
      results.push(iterator(popped, index, this._stack));
    }
    return results;
  },
});
