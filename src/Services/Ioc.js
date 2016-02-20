/**
 * Fiber Ioc Container
 * @class
 * @extends {Fiber.BaseCollection}
 */
Fiber.Ioc = Fiber.BaseCollection.extend({

  /**
   * Events namespace
   * @var {string}
   */
  eventsNs: 'ioc',

  /**
   * Events catalog
   * @var {Object}
   */
  eventsCatalog: {
    resolve: 'resolve',
    resolved: 'resolved'
  },

  /**
   * Ioc default Model
   * @var {Fiber.Model}
   */
  model: Fiber.Model.extend({

    /**
     * Model id attribute
     * @var {string}
     */
    idAttribute: 'key',

    /**
     * Model defaults
     * @var {Object}
     */
    defaults: { class: null, args: null, initializer: null }
  }),

  /**
   * Makes class instance by given `key`
   * @param {string} key
   * @returns {*}
   */
  make: function(key) {
    var model = this.get(key);
    if (! model) return null;

    var init = model.get('initializer');
    if (init) return init();

    return Fiber.fn.class.makeInstance(model.get('class'), model.get('args'));
  }

});
