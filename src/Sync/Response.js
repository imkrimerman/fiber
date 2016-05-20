/**
 * Response Class
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Response = Fiber.Class.extend({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Response]',

  /**
   * Constructs Response.
   * @param {Object.<Fiber.Request>|Object.<Fiber.Response.Raw>|Object.<Fiber.Request.Raw>} response
   */
  constructor: function(request) {
    this._request = null;
    this._response = null;
    this.from(request);
    this.$superInit({request: request});
  },

  /**
   * Constructs Response from the given `object`.
   * @param {Object.<Fiber.Request>|Object.<Fiber.Response.Raw>|Object.<Fiber.Request.Raw>} object
   * @returns {Fiber.Response}
   */
  from: function(object) {
    if (! object) return this;
    if (object instanceof Fiber.Request.Raw) object = new Fiber.Request(object);
    if (object instanceof Fiber.Request) {
      this._request = object;
      this._response = object.getRawRequest();
    }
    else if (object instanceof Fiber.Response.Raw) {
      this._request = new Fiber.Request(object.req);
      this._response = object;
    }
    return this;
  },

  /**
   * Returns Response body.
   * @returns {Array|Object|*}
   */
  getBody: function() {
    return this.body;
  },

  /**
   * Returns Response text.
   * @returns {string}
   */
  getText: function() {
    return this.text;
  },

  /**
   * Returns registered alias for Response `Content-Type`.
   * @returns {string}
   */
  getType: function() {
    return _.invert(Fiber.Request.types)[this.type];
  },

  /**
   * Returns raw Response `Content-Type`.
   * @returns {string}
   */
  getRawType: function() {
    return this.type;
  },

  /**
   * Returns response header by `field` name.
   * @param {string} field
   * @return {string}
   */
  getHeader: function(field) {
    return this._response.get(field);
  },

  /**
   * Returns all Response headers.
   * @returns {*|options.headers|{Content-Type}|{}|string}
   */
  getAllHeaders: function() {
    return this._response.headers
  },

  /**
   * Returns Response status code text.
   * @returns {string}
   */
  getStatus: function() {
    return Fiber.Response.status[this.getStatusCode()];
  },

  /**
   * Returns Response status code.
   * @returns {number}
   */
  getStatusCode: function() {
    return this._response.status;
  },

  /**
   * Returns Request that is connected to current Response.
   * @returns {Fiber.Request}
   */
  getRequest: function() {
    return this._request;
  },

  /**
   * Returns raw `superagent` Request object.
   * @returns {Fiber.Request.Raw}
   */
  getRawRequest: function() {
    this._request.getRawRequest();
  },

  /**
   * Returns raw `superagent` Response object.
   * @returns {Fiber.Response.Raw}
   */
  getRawResponse: function() {
    return this._response;
  },

  /**
   * Returns `XMLHttpRequest` that was used in Request.
   * @returns {Object.<XMLHttpRequest>}
   */
  getXhr: function() {
    return this.xhr;
  },

  /**
   * Determines if Response is successful.
   * @returns {boolean}
   */
  isSuccessful: function() {
    return this._response.ok;
  },

  /**
   * Determines if Response is failed and has error.
   * @returns {boolean}
   */
  isFailed: function() {
    return this.hasError();
  },

  /**
   * Determines if Response is `200` OK.
   * @return {boolean}
   */
  isOk: function() {
    return this.getStatusCode() === Fiber.Response.status['200'];
  },

  /**
   * Determines if Response is `202` Accepted.
   * @returns {boolean}
   */
  isAccepted: function() {
    return this.getStatusCode() === Fiber.Response.status['202'];
  },

  /**
   * Determines if Response is `204` No Content.
   * @returns {boolean}
   */
  isNoContent: function() {
    return this.getStatusCode() === Fiber.Response.status['204'];
  },

  /**
   * Determines if Response is `400` Bad Authorized.
   * @returns {boolean}
   */
  isBadAuthorized: function() {
    return this.getStatusCode() === Fiber.Response.status['400'];
  },

  /**
   * Determines if Response is `401` Unauthorized.
   * @returns {boolean}
   */
  isUnAuthorized: function() {
    return this.getStatusCode() === Fiber.Response.status['401'];
  },

  /**
   * Determines if Response is `403` Forbidden.
   * @returns {boolean}
   */
  isForbidden: function() {
    return this.getStatusCode() === Fiber.Response.status['403'];
  },

  /**
   * Determines if Response is `404` Not Found.
   * @returns {boolean}
   */
  isNotFound: function() {
    return this.getStatusCode() === Fiber.Response.status['404'];
  },

  /**
   * Determines if Response is `406` Not Accepted.
   * @returns {boolean}
   */
  isNotAccepted: function() {
    return this.getStatusCode() === Fiber.Response.status['406'];
  },

  /**
   * Determines if Response is `422` Unprocessable Entity.
   * @returns {boolean}
   */
  isUnProcessableEntity: function() {
    return this.getStatusCode() === Fiber.Response.status['422'];
  },

  /**
   * Determines if Response is `500` Internal Server Error.
   * @returns {boolean}
   */
  isInternalServerError: function() {
    return this.getStatusCode() === Fiber.Response.status['500'];
  },

  /**
   * Determines if Response has Error.
   * @returns {boolean}
   */
  hasError: function() {
    return ! (this._response.error instanceof Error);
  },

  /**
   * Determines if Response error was on the Client Side.
   * @returns {boolean}
   */
  isClientError: function() {
    return this._response.clientError;
  },

  /**
   * Determines if Response error was on the Server Side.
   * @returns {boolean}
   */
  isServerError: function() {
    return this._response.serverError;
  },

  /**
   * Returns an `Error` representation of the current response.
   * @return {Error}
   */
  toError: function() {
    return this._request.toError();
  },

  /**
   * Sets current Response body serialize function.
   * @param {Function} fn
   * @returns {Fiber.Response}
   */
  stringifier: function(fn) {
    this._response.serialize(fn);
    return this;
  }
}, {

  /**
   * Extended `superagent` Response Class.
   * @see {https://github.com/visionmedia/superagent}
   * @type {Function}
   */
  Raw: RawResponse,

  /**
   * Http Status Codes
   * @type {Object}
   */
  status: {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    300: "Multiple Choice",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
  }
});

/**
 * Add Response type to Fiber
 */
Fiber.Types.Response = new Fiber.Type({
  type: 'object',
  signature: Fiber.Response.prototype._signature,
  example: function() {return new Fiber.Response(new Fiber.Request('get'));}
});
