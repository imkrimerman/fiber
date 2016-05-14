/**
 * Sync Service
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Sync = Fiber.Class.extend({

  adapter: null,

  constructor: function() {},

  get: function() {},
  post: function() {},
  put: function() {},
  patch: function() {},
  delete: function() {},
  json: function() {},

  request: function(verb, url, options) {

  },

  send: function(verb, model, options) {
    return this.request(verb, model, options).send();
  },
}, {

  /**
   * Http methods map.
   * @type {Object}
   */
  Verbs: {
    read: 'GET',
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
  },

  /**
   * Http methods to Storage methods map
   * @type {Object}
   */
  Methods: {
    read: 'get',
    create: 'set',
    update: 'update',
    patch: 'update',
    delete: 'forget'
  },
});
