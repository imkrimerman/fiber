/**
 * Fiber Raw Response Class
 * @class
 * @extends {Fiber.Class}
 * @extends {superagent.Response}
 */
var RawResponse = Fiber.Class.extend(superagent.Response, {

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Response.RawClass]',

  /**
   * Returns an `Error` representation of this Response.
   * @return {Error}
   */
  toError: function() {
    var prefix = this._signature.replace('object ', '')
      , method = this.req.method
      , url = this.req.url
      , msg = '(' + this.status + '): Cannot `' + method + '` ' + url
      , err = new Error(prefix + msg);
    err.status = this.status;
    err.method = method;
    err.url = url;
    return err;
  }
});

/**
 * Add Raw Response type to Fiber.
 */
Fiber.Types.RawResponse = new Fiber.Type({
  type: 'object',
  signature: RawResponse.prototype._signature,
  example: function() {return new RawResponse(new RawRequest('get'));}
});
