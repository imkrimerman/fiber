// Fiber Model
Fiber.Model = Fiber.make(Backbone.Model, {

  // Hidden fields.
  // toJSON method will omit this fields.
  hidden: [],

  // Validation rules
  rules: {},

  // Events namespace
  eventsNs: 'model',

  // Events catalog
  eventsCatalog: {
    fetchSuccess: 'fetch:success',
    fetchError: 'fetch:error',
    invalid: 'invalid'
  },

  // Properties keys that will be auto extended from initialize object
  extendable: ['collection', 'url', 'hidden', 'rules', 'eventsNs', 'eventsCatalog'],

  // Model constructor
  constructor: function(attributes, options) {
    this.resetView();
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix + '-');
    this.attributes = {};
    this.applyExtendable(options);
    this.applyOwnProps();
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaultsDeep({}, attrs, _.result(this, 'defaults'));
    this.when('invalid', this.__whenInvalid.bind(this));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  },

  // Fetch model data
  fetch: function(options) {
    return Fiber.fn.superCall(Backbone.Model, 'fetch', [_.extend({}, options || {}, {
      success: this.__whenSuccess.bind(this),
      error: this.__whenError.bind(this)
    })]);
  },

  // Fetch success handler
  whenSuccess: function(model, response, options) {},

  // Fetch error handler
  whenError: function(model, response, options) {},

  // Validation error handler
  whenInvalid: function(model, errors, options) {},

  // Sends request using jQuery `ajax` method with the given `options`
  request: function(options) {
    return Fiber.$.ajax(options);
  },

  // Checks if Model is fetchable
  isFetchable: function() {
    try {
      var url = this.url();
      return _.isString(url);
    } catch (e) {
      return false;
    }
  },

  // Validates `attributes` of Model against `rules`
  validate: function(attrs, options) {
    return Fiber.fn.validate(this, attrs, options);
  },

  // Converts Model to JSON
  toJSON: function() {
    return _.omit(Fiber.fn.superCall(Backbone.Model, 'toJSON'), this.hidden);
  },

  // Returns validation `rules`
  getRules: function(defaults) {
    return _.result(this, 'rules', defaults);
  },

  // Sets validation `rules`
  setRules: function(rules) {
    this.rules = rules;
    return this;
  },

  // Returns next model.
  next: function(options) {
    return this.sibling(_.extend({direction: 'next'}, options || {}));
  },

  // Returns previous model.
  prev: function(options) {
    return this.sibling(_.extend({direction: 'prev'}, options || {}));
  },

  // Returns Sibling Model.
  // Options:
  //  direction: 'next', - direction to search, can be 'next' or 'prev'
  //  where: null, - options object to find model by, will be passed to the `collection.where`
  //  cid: null - if no model cid found will be used as default Model cid
  sibling: function(options) {
    if (! this.collection) return this;

    options = _.defaults(options || {}, {
      direction: 'next',
      where: null,
      cid: null
    });

    var cid = this.cid,
        models = options.where ? this.collection.where(options.where) : this.collection.models,
        dirCid;

    if (models.length) dirCid = _.first(models).cid;
    else dirCid = options.cid;

    for (var key = 0; key < models.length; key ++) {
      var model = models[key];
      if (model.cid !== cid) continue;

      if (options.direction === 'next') {
        if (key + 1 >= models.length) dirCid = _.first(models).cid;
        else dirCid = models[key + 1].cid; break;
      }
      else if (options.direction === 'prev') {
        if (key - 1 < 0) dirCid = _.last(models).cid;
        else dirCid = models[key - 1].cid; break;
      }
    }

    return dirCid != null ? this.collection.get(dirCid) : null;
  },

  // Sets model view
  setView: function(view) {
    this.__view = view;
  },

  // Gets model view
  getView: function() {
    return this.__view;
  },

  // Checks if has view
  hasView: function() {
    return ! _.isEmpty(this.__view);
  },

  // Resets view reference
  resetView: function() {
    this.__view = null;
    return this;
  },

  // Destroys model and also reset view reference
  destroy: function() {
    this.resetView();
    return Fiber.fn.superCall(Backbone.Model, 'destroy', arguments);
  },

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
  },

  // Private validation error handler
  __whenInvalid: function(model, errors, options) {
    this.whenInvalid.apply(this, arguments);
    this.fire('invalid', {
      model: model,
      errors: errors,
      options: options
    });
  }

});
