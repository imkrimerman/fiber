/**
 * Promise
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Promise = Fiber.Class.extend({

  /**
   * Events configuration
   * @type {Object}
   */
  eventsConfig: {

    /**
     * Events catalog to hold the events
     * @type {Object}
     */
    catalog: {
      resolved: 'resolved',
      rejected: 'rejected',
      finished: 'finished',
    }
  },

  /**
   * Constructs Promise
   * @param {function(...)|Function} executor
   * @param {Object} [executor]
   */
  constructor: function(executor, scope) {
    $fn.expect($isFn(executor));
    this._resolved = false;
    this._rejected = false;
    this._executor = scope ? executor.bind(scope) : executor;
    this._callbacks = new Fiber.Queue();
    this._start();
  },

  /**
   * Hook.
   * When promise resolve is fulfilled.
   * @param {function(...)|Function} [onFulFilled]
   * @param {function(...)|Function} [onRejected]
   * @returns {Fiber.Promise}
   */
  then: function(onFulFilled, onRejected) {
    return this._pushCallback(onFulFilled, onRejected);
  },

  /**
   * Hook.
   * When promise resolve is rejected.
   * @param {function(...)|Function} [onFulFilled]
   * @param {function(...)|Function} [onRejected]
   * @returns {Fiber.Promise}
   */
  catch: function(onRejected) {
    return this._pushCallback(null, onRejected);
  },

  /**
   * Reject function to pass to promise callback. To be called when promise is resolved.
   * @param {Error|*} reason
   * @returns {Array}
   */
  reject: function(reason) {
    return this._finish('rejected', reason);
  },

  /**
   * Resolve function to pass to promise callback. To be called when promise is rejected.
   * @param {*} value
   * @returns {Array}
   */
  resolve: function(value) {
    if (value === this) throw new TypeError('A promise cannot be resolved with itself.');
    return this._finish('resolved', value);
  },

  /**
   * Releases promise callbacks.
   * @param {function(...)|Function} iterator
   * @returns {Array}
   */
  release: function(iterator) {
    return this._callbacks.release(iterator, function() {
      return ! this.isFinished();
    }, this);
  },

  /**
   * Determines if promise is finished.
   * @returns {boolean}
   */
  isFinished: function() {
    return this.isResolved() || this.isRejected();
  },

  /**
   * Determines if promise is resolved.
   * @returns {boolean}
   */
  isResolved: function() {
    return this._resolved;
  },

  /**
   * Determines if promise is rejected.
   * @returns {boolean}
   */
  isRejected: function() {
    return this._rejected;
  },

  /**
   * Processes promise
   * @returns {*}
   * @private
   */
  _start: function() {
    this._executor(this.resolve, this.reject);
  },

  /**
   * Finishes promise execution by releasing callbacks.
   * @param {string|boolean} result
   * @param {*} param
   * @returns {Array}
   * @private
   */
  _finish: function(result, param) {
    this.fire(result, param);
    result = $valIncludes(result, false, [true, false, 'resolved', 'rejected']);
    if (_.isBoolean(result)) result = result ? 'resolved' : 'rejected';
    var unzipFn = result === 'resolved' ? 'onFulFilled' : 'onRejected'
      , released = this.release(function(zip) {return zip[unzipFn](param);});
    this['_' + result] = true;
    this.fire('finished', result, param, released, this);
    return released;
  },

  /**
   * Pushes callbacks.
   * @param {function(...)|Function} onFulFilled
   * @param {function(...)|Function} onRejected
   * @returns {Fiber.Promise}
   * @private
   */
  _pushCallback: function(onFulFilled, onRejected) {
    this._callbacks.enqueue({
      onFulFilled: onFulFilled || $fn.through,
      onRejected: onRejected || $fn.through
    });
    return this;
  },
});
