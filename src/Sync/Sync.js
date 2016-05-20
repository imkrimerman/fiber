/**
 * Sync Service
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Sync = Fiber.Class.extend({

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
      read: 'read',
      create: 'create',
      update: 'update',
      patch: 'patch',
      delete: 'delete',
      request: 'request',
      done: 'done',
      destroy: 'destroy'
    }
  },

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Sync]',

  /**
   * Constructs Request.
   * @param {Object.<Fiber.Model>} model
   * @param {Object} [options]
   */
  constructor: function(model, options) {
    $fn.expect(model.url);
    this.bag = new Fiber.Bag();
    this.model = model || {};
    this.options = $valMerge(options, _.extend({ prepare: true }, Fiber.Sync.emulate), 'defaults');
    this.$superInit({ model: model, options: options });
  },

  /**
   * Reads. Sends GET request
   * @returns {*|Object.<Fiber.Promise>}
   */
  read: function() {
    return this.process('read');
  },

  /**
   * Creates. Sends POST request.
   * @returns {*|Object.<Fiber.Promise>}
   */
  create: function() {
    return this.process('create');
  },

  /**
   * Update. Sends PUT request.
   * @returns {*|Object.<Fiber.Promise>}
   */
  update: function() {
    return this.process('update');
  },

  /**
   * Patch. Sends PATCH request.
   * @returns {*|Object.<Fiber.Promise>}
   */
  patch: function() {
    return this.process('patch');
  },

  /**
   * Delete. Sends DELETE request.
   * @returns {*|Object.<Fiber.Promise>}
   */
  delete: function() {
    return this.process('delete');
  },

  /**
   * Starts model synchronization with the given `method`.
   * @param {string} method
   * @returns {Object.<Fiber.Promise>}
   */
  process: function(method) {
    this.bag.set('method', method);

    this.prepareBag();
    this.createRequest(method, this.bag.get('url'));

    var params = this.bag.all();
    this.request.type(params.type);
    if (! _.isEmpty(params.data)) this.request.data(params.data);
    if (params.beforeSend) $fn.applyFn(params.beforeSend, [this.request])

    this.bag.set('promise', this.request.send());

    this.fire('request', this.model, this.request, this.bag, this);
    this.fire(method, this.model, this.request, this.bag, this);

    if (this.model.fire) this.model.fire('request', this.model, this.request, options);
    else if (this.model.trigger) this.model.trigger('request', this.model, this.request, options);
    return this.bag.get('promise');
  },

  /**
   * Prepares Request Bag.
   * @return {Fiber.Sync}
   */
  prepareBag: function() {
    if (! this.bag.get('options.prepare')) return this.markAsPreparedWithParams();
    var verbs = Fiber.Sync.verbs
      , options = this.options
      , model = this.model
      , method = this._method
      , verb = Fiber.Sync.methods[method]
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
    if (options.emulateHTTP && (verb === verbs.PUT || verb === verbs.DELETE || verb === verbs.PATCH)) {
      params.verb = verbs.POST;
      if (options.emulateJSON) params.data._method = verb;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(request) {
        request.set('X-HTTP-Method-Override', verb);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }
    // Don't process data on a non-GET request.
    if (params.verb !== verbs.GET && ! options.emulateJSON) params.processData = false;
    // Pass `textStatus` and `errorThrown` and put reference to an options.
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };
    return this.markAsPreparedWithParams($fn.merge(options, params));
  },

  /**
   * Creates new Request using method and Model url.
   * @param {string} method
   * @param {Object|Object.<Backbone.Model>|Object.<Fiber.Model>} model
   * @returns {Object.<Fiber.Request>}
   */
  createRequest: function(method, model) {
    $fn.expect(! _.isEmpty(model.url) && $isStr(model.url));
    this.request = new Fiber.Request(Fiber.Sync.methods[method], model.url);
    this.after(this.request, 'done', this.afterRequestDone.bind(this));
  },

  /**
   * Hook to trigger when request is done.
   * @param {Object.<Fiber.Request>} request
   * @param {Error|null} err
   * @param {Object.<Fiber.Response>} resp
   */
  afterRequestDone: function(request, err, resp) {
    this.fire('done', this, request, err, resp);
    if (err) this.fire('error', err, request, this);
    else this.fire('success', resp, request, this);
    this.request.flush();
  },

  /**
   * Marks Request as prepared and sets prepared params that will be used to send it.
   * @param {Object} [params]
   * @returns {Fiber.Sync}
   */
  markAsPreparedWithParams: function(params) {
    this.bag.set(params || { url: this.model.url, verb: Fiber.Request.verbs.GET });
    return this;
  },

  /**
   * Destroys Request Class.
   * @returns {Fiber.Sync}
   */
  destroy: function() {
    this.request.destroy();
    this.bag.flush();
    this.request = null;
    this.bag = null;
    this.fire('destroy', this);
    return this.$apply(Fiber.Class, 'destroy');
  }
}, {

  /**
   * Sync Methods
   * @type {Object}
   */
  methods: {
    read: 'GET',
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    'delete': 'DELETE',
  },

  /**
   * Emulate configuration
   * @type {Object}
   */
  emulate: {
    JSON: false,
    HTTP: false
  }

});
