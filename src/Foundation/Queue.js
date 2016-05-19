/**
 * Fiber Queue
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Queue = Fiber.Class.extend({

  /**
   * Queue holder.
   * @type {Array}
   * @private
   */
  _queue: [],

  /**
   * Constructs stack
   * @param {Array} [stack]
   */
  constructor: function(stack) {
    this._queue = $val(stack, [], $isArr);
  },

  /**
   * Pushes arguments to the queue.
   * @returns {Fiber.Queue}
   */
  enqueue: function() {
    $fn.apply(this._queue, 'push', arguments);
    return this;
  },

  /**
   * Returns first queue item.
   * @returns {*}
   */
  dequeue: function() {
    return this._queue.shift();
  },

  /**
   * Releases items by calling iterator on each item. If `check` is provided then till `check` returns true.
   * @param {function(...)|Function} iterator
   * @param {function(...)|Function} [check]
   * @param {Object} [scope]
   * @returns {Array}
   */
  release: function(iterator, check, scope) {
    if (! $isFn(check)) check = $fn.constant(true);
    var results = [], index = 0, len = this._queue.length;
    while (index < len) {
      var one = this.dequeue();
      if (! $fn.applyFn(check, [one, index, this._queue], scope)) return results;
      results.push(iterator(one, index, this._queue));
      ++ index;
    }
    return results;
  },

  /**
   * Returns size of the queue
   * @returns {Number}
   */
  size: function() {
    return this._queue.length;
  },
});
