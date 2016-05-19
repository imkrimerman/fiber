/**
 * Request Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Request = Fiber.Class.extend({

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
      send: 'send',
      abort: 'abort',
      destroy: 'destroy',
      response: 'response',
      success: 'success',
      error: 'error',
      progress: 'progress'
    }
  },

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Request]',

  /**
   * Constructs Request.
   * @param {string|Object.<Fiber.Request.RawClass>} verb
   * @param {string} [url]
   */
  constructor: function(verb, url) {
    this._sending = false;
    this._promise = null;
    this._request = null;
    this._callbacks = {};
    this.from(verb, url);
    this.$superInit({verb: verb, url: url});
  },

  /**
   * Constructs Request from the `verb` and `url` or from `superagent` Request
   * @param {string|Object.<Fiber.Request.RawClass>} verb
   * @param {string} [url]
   */
  from: function(verb, url) {
    this._sending = false;
    this._callbacks = {};
    if (this._request) this.destroy();
    if ($isStr(verb)) this._request = new Fiber.Request.RawClass(verb, url);
    else if (verb instanceof Fiber.Request.RawClass) this._request = verb;
    this._request.on('progress', $bind(this._onProgress, this));
    this._promise = new Fiber.Promise(function(fullFilled, rejected) {
      this.after('response', function(err, resp) {
        if (err) return rejected(err);
        return fullFilled(resp);
      });
    }, this);
  },

  /**
   * Returns request header `field`. Case-insensitive.
   * @param {string} field
   * @return {string}
   */
  get: function(field) {
    return this._request.get(field);
  },

  /**
   * Sets header `field` with the given `value` or multiple fields with one object.
   * Case-insensitive.
   *
   * Examples:
   *    set('Accept', 'application/json')
   *    set('X-API-Key', 'foobar')
   *    set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
   *
   * @param {string|Object} field
   * @param {string} value
   * @return {Fiber.Request}
   */
  set: function(field, value) {
    this._request.set(field, value);
    return this;
  },

  /**
   * Removes header `field` and returns value. Case-insensitive.
   * @param {string} field
   * @return {string}
   */
  forget: function(field) {
    var fieldValue = this._request.get(field);
    this._request.unset(field);
    return fieldValue;
  },

  /**
   * Queue the given `file` as an attachment to the specified `field`, with optional `filename`.
   * Examples:
   *      attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
   *
   * @param {string} field
   * @param {Blob|File} file
   * @param {string} filename
   * @return {Fiber.Request}
   */
  attach: function(field, file, filename) {
    this._request.attach(field, file, filename);
    return this;
  },

  /**
   * Set Authorization field value with `user` and `pass`.
   *
   * @param {string} username
   * @param {string} password
   * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
   * @return {Fiber.Request}
   */
  auth: function(username, password, options) {
    this._request.auth(username, password, options);
    return this;
  },

  /**
   * Set Accept to `type`, mapping values from `request.types`.
   *
   * Examples:
   *      Fiber.Request.types.json = 'application/json';
   *        accept('json')
   *        accept('application/json')
   *
   * @param {string} accept
   * @return {Fiber.Request}
   */
  accept: function(type) {
    this._request.accept(type);
    return this;
  },

  /**
   * Set responseType. Presently valid responseTypes are 'blob' and 'arraybuffer'.
   * @param {string} val
   * @return {Fiber.Request}
   */
  responseType: function(type) {
    this._request.responseType(type);
    return this;
  },

  /**
   * Uses extension.
   * @param {Function} fn
   * @return {Fiber.Request}
   */
  use: function(fn) {
    this._request.use(fn);
    return this;
  },

  /**
   * Write the field `name` and `val` for "multipart/form-data"
   * request bodies.
   * @param {string} name
   * @param {string|Blob|File|Buffer|fs.ReadStream} value
   * @return {Fiber.Request}
   */
  field: function(name, value) {
    this._request.field(name, value);
    return this;
  },

  /**
   * Adds object or string as query parameters.
   *
   * Examples:
   *     query('size=10')
   *     query({ color: 'blue' })
   *
   * @param {Object|string} val
   * @return {Fiber.Request}
   */
  query: function(value) {
    this._request.query(value);
    return this;
  },

  /**
   * Sets `data` as the request body, defaulting the `.type()` to `json` when an object is given.
   * @param data
   * @returns {Fiber.Request}
   */
  data: function(data) {
    this._request.send(data);
    return this;
  },

  /**
   * Set Content-Type to `type`, mapping values from `request.types`.
   * Available Content-Types: html, json, form, js, css, xml, form-data, urlencoded.
   * @param {string} type
   * @return {Fiber.Request}
   */
  type: function(type) {
    this._request.type(type);
    return this;
  },

  /**
   * Enable transmission of cookies with x-domain requests.
   * Note that for this to work the origin must not be using `Access-Control-Allow-Origin` with a wildcard ('*'),
   * and also must set `Access-Control-Allow-Credentials` to `true`.
   * @return {Fiber.Request}
   */
  withCredentials: function() {
    this._request.withCredentials();
    return this;
  },

  /**
   * Sends request
   * @returns {Object.<Fiber.Promise>}
   */
  send: function() {
    this._sending = true;
    this.fire('send', this);
    this._request.end($bind(this._onRequestEnd, this));
    return this._promise;
  },

  /**
   * Attaches promise callbacks.
   * @param {function(resp)} fullFilled
   * @param {function(err)} rejected
   * @returns {Fiber.Request}
   */
  then: function(fullFilled, rejected) {
    this._promise.then(fullFilled, rejected);
    return this;
  },

  /**
   * Attaches promise error handler.
   * @param {function(err)} rejected
   * @returns {Fiber.Request}
   */
  catch: function(rejected) {
    this._promise.catch(rejected);
    return this;
  },

  /**
   * Aborts current request
   * @return {Fiber.Request}
   */
  abort: function() {
    this._request.abort();
    this.fire('abort', this);
    return this;
  },

  /**
   * Destroys Request.
   * @returns {Fiber.Request}
   */
  destroy: function() {
    if (this._sending) this.abort();
    this._promise.destroy();
    this._callbacks = {};
    this._request = null;
    this._promise = null;
    this.fire('destroy', this);
    return this.$super('destroy');
  },

  /**
   * Sets current Request body parser function.
   * @param {Function} fn
   * @return {Fiber.Request}
   */
  parser: function(fn) {
    this._request.parse(fn);
    return this;
  },

  /**
   * Returns created Form Data or undefined otherwise.
   * @returns {FormData|void}
   */
  getFormData: function() {
    return this._request._formData ? this._request._formData : void 0;
  },

  /**
   * Returns raw `superagent` request object.
   * @returns {Fiber.Request.RawClass|Object}
   */
  getRawRequest: function() {
    return this._request;
  },

  /**
   * Set timeout to `ms`.
   * @param {number} ms
   * @return {Fiber.Request}
   */
  timeout: function(ms) {
    this._request.timeout(ms);
    return this;
  },

  /**
   * Clear previous timeout.
   * @return {Fiber.Request}
   */
  clearTimeout: function() {
    this._request.clearTimeout();
    return this;
  },

  /**
   * Hook.
   * On request ends.
   * @param {Object} err
   * @param {Object} res
   * @private
   */
  _onRequestEnd: function(err, res) {
    this._sending = false;
    this.fire('response', err, res, this);
    this.fire(err ? 'error' : 'success', err || res, this);
  },

  /**
   * Hook.
   * On progress.
   * @param {Object} event
   * @private
   */
  _onProgress: function(event) {
    this.fire('progress', event, this);
  }
}, {

  /**
   * Extended `superagent` Request Class.
   * @see {https://github.com/visionmedia/superagent}
   * @type {Function}
   */
  RawClass: RawRequest,

  /**
   * Request types.
   * @type {Object}
   */
  types: RawRequest.types,

  /**
   * Request body parsers by type.
   * @type {Object}
   */
  parse: RawRequest.parse,

  /**
   * Request body serializers by type.
   * @type {Object}
   */
  stringify: RawRequest.stringify
});

/**
 * Add Request type to Fiber.
 */
Fiber.Types.Request = new Fiber.Type({
  type: 'object',
  signature: Fiber.Request.prototype._signature,
  example: function() {return new Fiber.Request('get');}
});
