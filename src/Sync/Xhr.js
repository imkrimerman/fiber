/**
 * Xhr
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Sync.Xhr = Fiber.Class.extend({

  constructor: function(method, url, data, async) {
    this._xhr = $getXhr();
    this.$superInit(new Fiber.Bag({ method: method, url: url, data: data, async: async || true }));
  },

  open: function() {
    this._xhr.open(this.options.get('method'), this.options.get('url'), this.options.get('async'));
    return this;
  },

  send: function(data) {
    this.options.set('data', data);
    this.open();
  },

  abort: function() {},

  setRequestHeader: function() {},

  getResponseHeader: function() {},

  getAllResponseHeaders: function() {},
});

/**
 * Sets Xhr constants
 */
Fiber.Constants.set('Sync.Xhr', {
  send: {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  },
  success: {
    // File protocol always yields status code 0, assume 200
    0: 200,
    // Support: IE9
    // #1450: sometimes IE returns 1223 when it should be 204
    1223: 204
  }
});
