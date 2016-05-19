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
   * @param {Object.<Fiber.Request>|Object.<Fiber.Response.RawClass>|Object.<Fiber.Request.RawClass>} response
   */
  constructor: function(request) {
    this._request = null;
    this._response = null;
    this.from(request);
    this.$superInit({request: request});
  },

  /**
   * Constructs Response from the given `object`.
   * @param {Object.<Fiber.Request>|Object.<Fiber.Response.RawClass>|Object.<Fiber.Request.RawClass>} object
   * @returns {Fiber.Response}
   */
  from: function(object) {
    if (! object) return this;
    if (object instanceof Fiber.Request.RawClass) object = new Fiber.Request(object);
    if (object instanceof Fiber.Request) {
      this._request = object;
      this._response = object.getRawRequest();
    }
    else if (object instanceof Fiber.Response.RawClass) {
      this._request = new Fiber.Request(object.req);
      this._response = object;
    }
    return this;
  },

  /**
   * Returns Response status code.
   * @returns {number}
   */
  getStatusCode: function() {
    return this._response.status;
  },

  /**
   * Returns Response status code text.
   * @returns {string}
   */
  getStatus: function() {
    return Fiber.Response.status[this.getStatusCode()];
  },

  /**
   * Returns Response status type.
   * @returns {number}
   */
  getStatusType: function() {
    return this._response.statusType;
  },

  isSuccess: function() {
    return this._response.ok;
  },

  isError: function() {
    return this.hasError();
  },

  isClientError: function() {
    return this._response.clientError;
  },

  isServerError: function() {
    return this._response.serverError;
  },

  isAccepted: function() {
    return this.getStatusCode() === Fiber.Response.status['202'];
  },

  isNoContent: function() {
    return this.getStatusCode() === Fiber.Response.status['204'];
  },

  isBadAuthorized: function() {
    return this.getStatusCode() === Fiber.Response.status['400'];
  },

  isUnAuthorized: function() {
    return this.getStatusCode() === Fiber.Response.status['401'];
  },

  isForbidden: function() {
    return this.getStatusCode() === Fiber.Response.status['403'];
  },

  isNotFound: function() {
    return this.getStatusCode() === Fiber.Response.status['404'];
  },

  isNotAccepted: function() {
    return this.getStatusCode() === Fiber.Response.status['406'];
  },

  isUnProcessableEntity: function() {
    return this.getStatusCode() === Fiber.Response.status['422'];
  },

  isInternalServerError: function() {
    return this.getStatusCode() === Fiber.Response.status['500'];
  },

  /**
   * Retrieves response header by `field` name.
   * @param {string} field
   * @return {string}
   */
  get: function(field) {
    return this._response.get(field);
  },

  /**
   * Returns all Response headers
   * @returns {*|options.headers|{Content-Type}|{}|string}
   */
  getHeaders: function() {
    return this._response.headers
  },

  /**
   * Returns all response data.
   * @returns {Object}
   */
  all: function() {
    return $pick(this._response, $fn.properties(this._response, true));
  },

  /**
   * Sets current Response body serialize function.
   * @param {Function} fn
   * @returns {Fiber.Response}
   */
  stringifier: function(fn) {
    this._response.serialize(fn);
    return this;
  },

  /**
   * Returns Request that is connected to current Response.
   * @returns {Fiber.Request}
   */
  getRequest: function() {
    return this._request;
  },

  /**
   * Returns raw `superagent` Response object.
   * @returns {Fiber.Response.RawClass}
   */
  getRawResponse: function() {
    return this._response;
  },

  /**
   * Returns raw `superagent` Request object.
   * @returns {Fiber.Request.RawClass}
   */
  getRawRequest: function() {
    this._request.getRawRequest();
  },

  /**
   * Determines if Response has Error.
   * @returns {boolean}
   */
  hasError: function() {
    return ! (this._response.error instanceof Error);
  },

  /**
   * Returns an `Error` representation of the current response.
   * @return {Error}
   */
  toError: function() {
    return this._request.toError();
  },

  /**
   * Parses the given body `string`.
   * Used for bodies auto-parsing. Parsers are defined on the `Fiber.Request.parse` object.
   * @param {string} body
   * @return {mixed}
   */
  parseBody: function(body) {
    return this._response.parseBody(body);
  }
}, {

  /**
   * Extended `superagent` Response Class.
   * @see {https://github.com/visionmedia/superagent}
   * @type {Function}
   */
  RawClass: RawResponse,

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
