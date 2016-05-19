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
   * @param {string} verb
   * @param {string} [url]
   */
  constructor: function(verb, url) {
    this._callbacks = {};
    this._request = $request(verb, url);
    this._request.on('progress', $bind(this._onProgress, this));
    this.$superInit({verb: verb, url: url});
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
   * Uses extension.
   * @param {Function} fn
   * @return {Fiber.Request}
   */
  use: function(fn) {
    this._request.use(fn);
    return this;
  },

  /**
   * Sets body parser function.
   * @param {Function} fn
   * @returns {Fiber.Request}
   */
  parse: function(fn) {
    this._request.parse(fn);
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
   * Sets `data` as the request body, defaulting the `.type()` to "json" when
   * an object is given.
   * @param data
   * @returns {Fiber.Request}
   */
  data: function(data) {
    this._request.send(data);
    return this;
  },

  /**
   * Set Content-Type to `type`, mapping values from `request.types`.
   *
   * Examples:
   *        type('json')
   *        type('form')
   *        type('xml')
   *        type('application/xml')
   *
   * @param {string} type
   * @return {Fiber.Request}
   */
  type: function(type) {
    this._request.type(type);
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
   * Set timeout to `ms`.
   *
   * @param {number} ms
   * @return {Fiber.Request}
   */
  timeout: function(ms) {
    this._request.timeout(ms);
    return this;
  },

  /**
   * Sends request
   * @param {Object} [callbacks]
   * @returns {Fiber.Request}
   */
  send: function(callbacks) {
    if ($isPlain(callbacks)) this._callbacks = callbacks;
    this.fire('send', this);
    this._request.end($bind(this._onRequestEnd, this));
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
   * Destroys Request
   * @returns {Fiber.Request}
   */
  destroy: function() {
    this.abort();
    this._callbacks = {};
    this._request = null;
    this.fire('destroy', this);
    return this.$super('destroy');
  },

  /**
   * Hook.
   * On request ends.
   * @param {Object} err
   * @param {Object} res
   * @private
   */
  _onRequestEnd: function(err, res) {
    var response = err || res;
    if (err) $isFn(this._callbacks.error) && this._callbacks.error(response, this);
    else $isFn(this._callbacks.success) && this._callbacks.success(response, this);
    this.fire(err ? 'error' : 'success', response, this);
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
});

/**
 * Add Request type to Fiber
 */
Fiber.Types.Request = new Fiber.Type({
  type: 'object',
  signature: Fiber.Request.prototype._signature,
  example: function() {return new Fiber.Request;}
});
