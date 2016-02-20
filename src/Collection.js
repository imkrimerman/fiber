/**
 * Fiber Collection
 * @class
 * @extends {Fiber.BaseCollection}
 */
Fiber.Collection = Fiber.BaseCollection.extend({

  /**
   * Properties keys that will be auto extended from initialize object
   * @var {Array|Function}
   */
  extendable: ['model', 'url', 'eventsNs', 'eventsCatalog'],

  /**
   * Properties keys that will be owned by the instance
   * @var {Array|Function}
   */
  ownProp: ['eventsNs', 'eventsCatalog'],

  /**
   * Model by default
   * @var {Fiber.Model}
   */
  model: Fiber.Model,

  /**
   * Events namespace
   * @var {string}
   */
  eventsNs: 'collection',

  /**
   * Events catalog
   * @var {Object}
   */
  eventsCatalog: {
    fetchSuccess: 'fetch:success',
    fetchError: 'fetch:error'
  },

  /**
   * Constructor
   * @param {Object[]|Array} models - Model to construct with
   * @param {?Object} [options] - Options to extend from
   */
  constructor: function(models, options) {
    this.applyExtend(options);
    this.applyOwnProps();
    Backbone.Collection.apply(this, arguments);
  },

  /**
   * Checks if collection is fetchable
   * @returns {boolean}
   */
  isFetchable: function() {
    return _.isString(this.result('url'));
  },

  /**
   * Fetches collection data
   * @param {?Object} [options] - Options to pass to Backbone sync
   * @returns {*}
   */
  fetch: function(options) {
    return Fiber.fn.apply(Backbone.Collection, 'fetch', [
      _.extend({}, options || {}, {
        success: this.__whenSuccess.bind(this),
        error: this.__whenError.bind(this)
      })
    ], this);
  },

  /**
   * Fetch success handler
   * @param {Object.<Fiber.Model>} model - Model that was fetched
   * @param {Array|Object} response - Server response
   * @param {?Object} [options] - Options to pass to Backbone sync
   */
  whenSuccess: function(model, response, options) {},

  /**
   * Fetch error handler
   * @param {Object.<Fiber.Model>} model - Model that was fetched
   * @param {Array|Object} response - Server response
   * @param {?Object} [options] - Options to pass to Backbone sync
   */
  whenError: function(model, response, options) {},

  /**
   * Private success handler
   * @param {Object.<Fiber.Model>} model - Model that was fetched
   * @param {Array|Object} response - Server response
   * @param {?Object} [options] - Options to pass to Backbone sync
   * @private
   */
  __whenSuccess: function(model, response, options) {
    this.whenSuccess.apply(this, arguments);
    this.fire('fetchSuccess', {
      model: model,
      response: response,
      options: options
    });
  },

  /**
   * Private error handler
   * @param {Object.<Fiber.Model>} model - Model that was fetched
   * @param {Array|Object} response - Server response
   * @param {?Object} [options] - Options to pass to Backbone sync
   * @private
   */
  __whenError: function(model, response, options) {
    this.whenError.apply(this, arguments);
    this.fire('fetchError', {
      model: model,
      response: response,
      options: options
    });
  }
});
