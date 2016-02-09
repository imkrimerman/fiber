// Fiber Collection
Fiber.Collection = Fiber.make(Backbone.Collection, ['NsEvents', 'Mixin', 'Extandable', 'OwnProperties', {

  // Properties keys that will be auto extended from initialize object
  extendable: ['model', 'url', 'eventsNs', 'eventsCatalog'],

  // Properties keys that will be owned by the instance
  ownProp: ['eventsNs', 'eventsCatalog'],

  // Set Fiber Model by default
  model: Fiber.Model,

  // Events namespace
  eventsNs: 'collection',

  // Events catalog
  eventsCatalog: {
    fetchSuccess: 'fetch:success',
    fetchError: 'fetch:error'
  },

  constructor: function(models, options) {
    this.applyExtendable(val(options, {}));
    this.applyOwnProps();
    Backbone.Collection.apply(this, arguments);
  },

  // Checks if collection is fetchable
  isFetchable: function() {
    return _.isString(this.result('url'));
  },

  // Fetch model data
  fetch: function(options) {
    return Fiber.fn.apply(Backbone.Collection, 'fetch', [_.extend({}, options || {}, {
      success: this.__whenSuccess.bind(this),
      error: this.__whenError.bind(this)
    })]);
  },

  // Fetch success handler
  whenSuccess: function(model, response, options) {},

  // Fetch error handler
  whenError: function(model, response, options) {},

  // Private success handler
  __whenSuccess: function(model, response, options) {
    this.whenSuccess.apply(this, arguments);
    this.fire('fetchSuccess', {
      model: model,
      response: response,
      options: options
    });
  },

  // Private error handler
  __whenError: function(model, response, options) {
    this.whenError.apply(this, arguments);
    this.fire('fetchError', {
      model: model,
      response: response,
      options: options
    });
  }
}], {extend: extend});
