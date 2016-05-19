/**
 * Fiber Raw Request Class
 * @class
 * @extends {Fiber.Class}
 * @extends {superagent.Request}
 */
var RawRequest = Fiber.Class.extend(superagent.Request, {

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Request.RawClass]',

  /**
   * Invoke current callback with `err` and `res`.
   * @param {Object.<Error>} err
   * @param {Object.<superagent.Response>} res
   */
  callback: function(err, res) {
    return this.$super('callback', [err, new Fiber.Response.RawClass(res)]);
  },

  /**
   * Returns an `Error` representation of this Request.
   * @return {Error}
   */
  toError: function() {
    var method = this.method
      , url = this.url
      , prefix = this._signature.replace('object ', '') + ' >> '
      , msg, err;
    if (! method && ! url) msg = 'Request is empty, `method` and `url` are required.';
    else msg = '(' + this.status + '): Cannot `' + method + '` ' + url;
    err = new Error(prefix + msg);
    err.status = this.status;
    err.method = method;
    err.url = url;
    return err;
  }

}, {

  /**
   * Request types.
   * @type {Object}
   */
  types: _.extend(superagent.types, {
    js: 'text/javascript',
    css: 'text/css'
  }),

  /**
   * Request body parsers by type.
   * @type {Object}
   */
  parse: _.extend(superagent.parse, {
    'text/javascript': $through,
    'text/css': $through
  }),

  /**
   * Request body serializers by type.
   * @type {Object}
   */
  stringify: _.extend(superagent.serialize, {
    'text/javascript': $through,
    'text/css': $through
  })
});

/**
 * Add Raw Request type to Fiber.
 */
Fiber.Types.RawRequest = new Fiber.Type({
  type: 'object',
  signature: RawRequest.prototype._signature,
  example: function() {return new RawRequest('get');}
});
