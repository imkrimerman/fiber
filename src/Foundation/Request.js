/**
 * Request Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Request = Fiber.Class.extend({

  /**
   * HTTP Verbs map
   * @type {Object}
   */
  verbs: {
    read: 'GET',
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
  },

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Request]',

  /**
   * Constructs request
   * @param {string} method
   * @param {Object.<Fiber.Model>} model
   * @param {Object} [options]
   */
  constructor: function(method, model, options) {
    this.resetEventProperties();
    this._prepared = false;
    this.bag = new Fiber.Bag({
      method: method,
      type: this.verbs[method],
      model: model,
      options: $valMerge(options, {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
      }, 'defaults'),
    });
  },

  /**
   * Prepares request and it's options
   * @return {Fiber.Request}
   */
  prepare: function() {
    var options = this.bag.get('options')
      , model = this.bag.get('model')
      , method = this.bag.get('method')
      , type = this.bag.get('type')
      , error = options.error
      , params = {type: type, dataType: 'json'};
    // Retrieve url
    if (! options.url) params.url = $fn.result(model, 'url') || $log.errorThrow('Cannot send request without' +
                                                                                ' valid `url`.');
    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }
    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }
    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }
    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && ! options.emulateJSON) params.processData = false;
    // Pass along `textStatus` and `errorThrown` from jQuery.
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };
    this.set('options', $fn.merge(options, params));
    this._prepared = true;
    return this;
  },

  /**
   * Sends request
   * @returns {JQueryXHR}
   */
  send: function() {
    if (! this._prepared) this.prepare();
    var options = this.get('options')
      , model = this.get('model')
      , xhr = options.xhr = Backbone.ajax(options);
    model.trigger('request', model, xhr, options);
    return xhr;
  },

  /**
   * Destroys request Class
   * @returns {Fiber.Request}
   */
  destroy: function() {
    this.bag.flush();
    this._prepared = false;
    return this.$super('destroy');
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
