/**
 * Fiber Ioc Container
 * @class
 * @type {Function}
 * @memberof Fiber#
 */
Fiber.Ioc = Fiber.Collection.extend({

  /**
   * Events namespace
   * @var {string}
   * @memberof Fiber.Ioc#
   */
  eventsNs: 'ioc',

  /**
   * Events catalog
   * @var {Object}
   * @memberof Fiber.Ioc#
   */
  eventsCatalog: {
    resolve: 'resolve',
    resolved: 'resolved'
  },

  /**
   * Ioc default Model
   * @var {Fiber.Model}
   * @memberof Fiber.Ioc#
   */
  model: Fiber.Model.extend({

    /**
     * Model id attribute
     * @var {string}
     * @memberof Fiber.Ioc.Model#
     */
    idAttribute: 'key',

    /**
     * Model defaults
     * @var {Object}
     * @memberof Fiber.Ioc.Model#
     */
    defaults: { class: null, args: null }
  }),

  /**
   * Makes class instance by given `key`
   * @param {string} key
   * @returns {*}
   * @memberof Fiber.Ioc#
   */
  create: function(key) {
    var model = this.get(key);
    if (! model) return model;
    return Fiber.fn.class.makeInstance(model.get('class'), model.get('args'));
  },

});
