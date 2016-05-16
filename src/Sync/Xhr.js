/**
 * Xhr Config
 */
Fiber.Config.set('Sync.Xhr', {
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

/**
 * Xhr
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Sync.Xhr = Fiber.Class.extend({

  defaults: {
    method: 'get',
    url: '',
    async: true
  },

  constructor: function(options) {
    this._xhr = $getXhr();
    this.$superInit();
    $fn.class.handleOptions(this, options, $result(this.defaults));
  },

  open: function(user, password) {
    this._xhr.open(this.options.method, this.options.url, this.options.async, user, password);
    if (this.options.xhrFields) {
      for (var key in this.options.xhrFields) {
        this._xhr[key] = this.options.xhrFields[key];
      }
    }
    // Override mime type if needed
    if (this.options.mimeType) this.overrideMimeType(this.options.mimeType);
    // X-Requested-With header
    // For cross-domain requests, seeing as conditions for a preflight are
    // akin to a jigsaw puzzle, we simply never set it to be sure.
    // (it can always be set on a per-request basis or even using ajaxSetup)
    // For same-domain requests, won't change header if already provided.
    if (! this.options.crossDomain && ! this.options.headers["X-Requested-With"])
      this.options.headers["X-Requested-With"] = "XMLHttpRequest";
    // Set headers
    for (var key in this.options.headers) this.setRequestHeader(key, headers[key]);
    this._xhr.onreadystatechange = this._onReadyStateChanged.bind(this);
    this._xhr.onload = this._onLoad.bind(this);
    return this;
  },

  send: function(data) {
    $isDef(data) && (this.options.data = data);
    this._xhr.send(this.options.data);
    return this;
  },

  abort: function() {
    this._xhr.abort();
    return this;
  },

  transmit: function(data) {
    this.open();
    return this.send(data);
  },

  setRequestHeader: function(header, value) {
    return this._xhr.setRequestHeader(header, value);
  },

  getResponseHeader: function(header) {
    return this._xhr.getResponseHeader(header);
  },

  getAllResponseHeaders: function() {
    return this._xhr.getAllResponseHeaders();
  },

  overrideMimeType: function(mime) {
    this._xhr.overrideMimeType && this._xhr.overrideMimeType(mime);
    return this;
  },

  _onReadyStateChanged: function() {

  },

  _onLoad: function(type) {

  },
});
