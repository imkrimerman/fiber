Fiber.Promise = Fiber.Class.extend({

  constructor: function(executor) {
    this._resolved = false;
    this._rejected = false;
    this._executor = executor;
    this._callbacks = [];
    this._process();
  },

  then: function(onFulFilled, onRejected) {
    this._callbacks.push({
      onFulFilled: onFulFilled || $fn.through,
      onRejected: onRejected || $fn.through
    });
    return this;
  },

  catch: function(onRejected) {
    this._callbacks.push({
      onFulFilled: $fn.through,
      onRejected: onRejected || $fn.through
    });
    return this;
  },

  reject: function(reason) {
    this._rejected = true;
    return $fn.multi(this._callbacks, function(zip) {
      return zip.onRejected(reason);
    });
  },

  resolve: function(value) {
    if (value === this) throw new TypeError('A promise cannot be resolved with itself.');
    this._resolved = true;
    return $fn.multi(this._callbacks, function(zip) {
      return zip.onFulFilled(value);
    });
  },

  _process: function() {
    return this._executor(this.resolve, this.reject);
  }
});
