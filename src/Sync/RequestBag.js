/**
 * Request Bag
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Sync.RequestBag = Fiber.Bag.extend({

  /**
   * Bag items defaults
   * @type {Object|function()}
   */
  defaults: {
    method: 'read',
    model: {},
    params: {},
    options: {
      type: 'json',
      prepare: true,
      emulateJSON: Fiber.Config.get('Sync.Emulate.JSON'),
      emulateHTTP: Fiber.Config.get('Sync.Emulate.HTTP')
    },
  },

  /**
   * Computed getter for Http Request Verb.
   * @returns {string}
   */
  getVerbAttribute: function() {
    return Fiber.Config.get('Sync.Methods.' + this.get('method').toLowerCase());
  },

  /**
   * Sets Http Request Verb.
   * @param {string} verb
   * @returns {string}
   */
  setVerbAttributes: function(verb) {
    this.set('method', _.invert(Fiber.Config.get('Sync.Methods'))[verb.toUpperCase()]);
    return verb;
  },
});
