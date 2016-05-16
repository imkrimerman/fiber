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
