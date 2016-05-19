/**
 * Sync Service
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Sync = Fiber.Class.extend({

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Sync]',

  /**
   * Constructs Request.
   * @param {string} method
   * @param {Object.<Fiber.Model>} model
   * @param {Object} [options]
   */
  constructor: function(method, model, options) {
    this.createBag(method, model, options);
    this.prepareParams();
    this.createRequestObject(this._bag.get('verb'), this._bag.get('params.url'));
    this.$superInit({ method: method, model: model, options: options });
  },

  /**
   * Uses extension.
   * @param {Function} fn
   * @return {Fiber.Sync}
   */
  use: function(fn) {
    this._request.use(fn);
    return this;
  },

  /**
   * Sets body parser function.
   * @param {Function} fn
   * @returns {Fiber.Sync}
   */
  parse: function(fn) {
    this._request.parse(fn);
    return this;
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
   * @return {Fiber.Sync}
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
   * Write the field `name` and `val` for "multipart/form-data"
   * request bodies.
   * @param {string} name
   * @param {string|Blob|File|Buffer|fs.ReadStream} value
   * @return {Fiber.Sync}
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
   * @return {Fiber.Sync}
   */
  query: function(value) {
    this._request.query(value);
    return this;
  },

  /**
   * Sets `data` as the request body, defaulting the `.type()` to "json" when
   * an object is given.
   * @param data
   * @returns {Fiber.Sync}
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
   * @return {Fiber.Sync}
   */
  type: function(type) {
    this._request.type(type);
    return this;
  },

  /**
   * Clear previous timeout.
   * @return {Fiber.Sync}
   */
  clearTimeout: function() {
    this._request.clearTimeout();
    return this;
  },

  /**
   * Set timeout to `ms`.
   *
   * @param {number} ms
   * @return {Fiber.Sync}
   */
  timeout: function(ms) {
    this._request.timeout(ms);
    return this;
  },

  /**
   * Prepares Request parameters.
   * @return {Fiber.Sync}
   */
  prepareParams: function() {
    if (! this._bag.get('options.prepare')) return this.markAsPreparedWithParams(this._bag.get('options'));
    var Verbs = Fiber.Config.get('Sync.Verbs')
      , options = this._bag.get('options')
      , model = this._bag.get('model')
      , method = this._bag.get('method')
      , verb = this._bag.get('verb')
      , error = options.error
      , params = { type: 'json', verb: verb };
    // Retrieve url from Model
    if (! options.url) params.url = $result(model, 'url') || $log.error('`Url` is not found. Aborting request.');
    // if `model` is instance of Model then lets convert it to JSON hash
    if (model instanceof Backbone.Model) model = model.toJSON(options);
    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.type = 'json';
      params.data = JSON.stringify(options.attrs || model);
    }
    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.type = 'form';
      params.data = params.data ? { model: params.data } : {};
    }
    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (verb === Verbs.put || verb === Verbs['delete'] || verb === Verbs.patch)) {
      params.verb = Verbs.post;
      if (options.emulateJSON) params.data._method = verb;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(request) {
        request.set('X-HTTP-Method-Override', verb);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }
    // Don't process data on a non-GET request.
    if (params.verb !== Verbs.get && ! options.emulateJSON) params.processData = false;
    // Pass `textStatus` and `errorThrown` and put reference to an options.
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };
    return this.markAsPreparedWithParams($fn.merge(options, params));
  },

  /**
   * Sends request
   * @returns {JQueryXHR}
   */
  send: function() {
    var params = this._bag.get('params')
      , model = this._bag.get('model')
      , promise;

    this.type(params.type);

    if (! _.isEmpty(params.data)) {
      if (params.type === 'form') this.query(params.data);
      else this.data(params.data);
    }

    if (params.beforeSend) $fn.applyFn(params.beforeSend, [this._request])
    //todo: not allow parsing JSON on non GET method
    this._bag.set('promise', promise = new Fiber.Promise(function(fullFill, rejected) {
      this._request.end(function(err, response) {
        if (err) rejected(err);
        fullFill(response);
      });
    }, this));

    if (model.fire) model.fire('request', model, this._request, options);
    else if (model.trigger) model.trigger('request', model, this._request, options);
    return promise;
  },

  /**
   * Destroys Request Class
   * @returns {Fiber.Sync}
   */
  destroy: function() {
    this._request.abort();
    this._request = null;
    this._bag.flush();
    return this.$super('destroy');
  },

  /**
   * Marks Request as prepared and sets prepared params that will be used to send it.
   * @param {Object} params
   * @returns {Fiber.Sync}
   */
  markAsPreparedWithParams: function(params) {
    this._bag.set('params', params);
    return this;
  },

  /**
   * Creates Request Bag.
   * @param {string} method
   * @param {Object|Backbone.Model|Fiber.Model} model
   * @param {Object} [options]
   * @returns {Object.<Fiber.Bag>}
   */
  createBag: function(method, model, options) {
    return this._bag = new Fiber.SyncBag({ method: method, model: model, options: options });
  },

  /**
   * Returns Request Bag.
   * @returns {Object.<Fiber.Bag>}
   */
  getBag: function() {
    return this._bag;
  },

  /**
   * Sets given Bag as Request Bag.
   * @param {Object.<Fiber.Bag>} bag
   * @returns {Fiber.Sync}
   */
  setBag: function(bag) {
    if (bag instanceof Fiber.Bag) this._bag = bag;
    return this;
  },

  /**
   * Determines if Request has valid Bag.
   * @returns {boolean}
   */
  hasBag: function() {
    return this._bag instanceof Fiber.Bag;
  },

  /**
   * Creates request object.
   * @param {string} verb
   * @return {Fiber.Sync}
   */
  createRequestObject: function(verb, url) {
    this._request = $request(verb, url);
    return this;
  },

  /**
   * Returns inner request object.
   * @returns {$request}
   */
  getRequestObject: function() {
    return this._request;
  },

  /**
   * Sets inner request object.
   * @param {$request} object
   * @returns {Fiber.Sync}
   */
  setRequestObject: function(object) {
    if (object instanceof $request) this._request = object;
    return this;
  }
});

/**
 * Http methods map.
 * @type {Object}
 */
Fiber.Config.set('Sync', {
  Verbs: {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    patch: 'PATCH',
    'delete': 'DELETE'
  },
  Methods: {
    read: 'GET',
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    'delete': 'DELETE',
  },
  Emulate: {
    JSON: false,
    HTTP: false
  },
  Fn: {
    get: 'read',
    set: 'create',
    update: 'update',
    forget: 'delete',
    result: 'read'
  }
});
