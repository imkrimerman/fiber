// Fiber Model
Fiber.Model = Fiber.fn.class.make(Backbone.Model, [
  'NsEvents', 'Extend', 'Mixin', 'OwnProperties', Fiber.fn.proto(), {

  // Hidden fields.
  // toJSON method will omit this fields.
  hidden: [],

  // Validation rules
  rules: {},

  /**
   * Error bag
   * @type {Object.<Fiber.ErrorBag>}
   */
  errorBag: null,

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
    this.errorBag = new Fiber.ErrorBag();
    this.resetView();
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix + '-');
    this.attributes = {};
    this.applyExtend(options);
    this.applyOwnProps();
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaultsDeep({}, attrs, _.result(this, 'defaults'));
    this.listenTo(this, 'invalid', this.__whenInvalid.bind(this));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  },

  // Fetch model data
  fetch: function(options) {
    return Fiber.fn.apply(Backbone.Model, 'fetch', [_.extend({}, options || {}, {
      success: this.__whenSuccess.bind(this),
      error: this.__whenError.bind(this)
    })], this);
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
      return _.isString(_.result(this, 'url'));
    } catch (e) {
      return false;
    }
  },

  // Validates `attributes` of Model against `rules`
  validate: function(attrs, options) {
    Fiber.fn.validation.validate(this, val(attrs, this.attributes), options);
    return this.errorBag.getErrors();
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

  // Checks if `rules` is not empty
  hasRules: function() {
    return ! _.isEmpty(this.rules);
  },

  // Converts Model to JSON
  toJSON: function() {
    return _.omit(Fiber.fn.apply(Backbone.Model, 'toJSON', [], this), this.hidden);
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
      defaultCid: null
    });

    var cid = this.cid,
        models = options.where ? this.collection.where(options.where) : this.collection.models,
        dirCid;

    if (models.length) dirCid = _.first(models).cid;
    else dirCid = options.defaultCid;

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

    return dirCid != null ? this.collection.get(dirCid) : this;
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
    return Fiber.fn.apply(Backbone.Model, 'destroy', arguments, this);
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
}]);

/**
 * Extend method
 * @var {Function}
 * @static
 */
Fiber.Model.extend = Fiber.fn.proxy(Fiber.fn.class.extend);
