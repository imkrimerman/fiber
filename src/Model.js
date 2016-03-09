/**
 * Fiber Model
 * @class
 * @extends {Backbone.Model}
 */
Fiber.Model = Fiber.fn.class.make(Backbone.Model, [
  'NsEvents', 'Extend', 'Mixin', 'OwnProperties', 'Binder', {

    /**
     * Hidden fields.
     * toJSON method will omit this fields.
     * @var {Array|Function}
     */
    hidden: [],

    /**
     * Validation rules
     * @var {Object|Function}
     */
    rules: {},

    /**
     * Error bag
     * @var {Object.<Fiber.ErrorBag>}
     */
    errorBag: null,

    /**
     * Events namespace
     * @var {string}
     */
    eventsNs: '',

    /**
     * Events catalog
     * @var {Object}
     */
    eventsCatalog: {
      fetchSuccess: 'fetch:success',
      fetchError: 'fetch:error',
      invalid: 'invalid'
    },

    /**
     * Properties keys that will be auto extended from initialize object
     * @var {Array|Function}
     */
    extendable: ['collection', 'url', 'hidden', 'rules', 'eventsNs', 'eventsCatalog'],

    /**
     * Properties keys that will be owned by the instance
     * @var {Array|Function}
     */
    ownProps: ['hidden', 'rules'],

    /**
     * Constructs Model
     * @param {?Object} [attributes={}]
     * @param {?Object} [options={}]
     */
    constructor: function(attributes, options) {
      this.options = options;
      this.errorBag = new Fiber.ErrorBag();
      this.resetView();
      var attrs = attributes || {};
      options || (options = {});
      this.cid = _.uniqueId(this.cidPrefix + '-');
      this.attributes = {};
      this.applyExtend(options);
      this.applyOwnProps();
      this.applyBinder();
      if (options.parse) attrs = this.parse(attrs, options) || {};
      attrs = _.defaultsDeep({}, attrs, _.result(this, 'defaults'));
      this.listenTo(this, 'invalid', this.__whenInvalid.bind(this));
      this.set(attrs, options);
      this.changed = {};
      this.initialize.apply(this, arguments);
    },

    /**
     * Validates `attributes` of Model against `rules`
     * @param {?Object} [attributes=this.attributes]
     * @param {?Object} [options={}]
     * @returns {Object|undefined}
     */
    validate: function(attributes, options) {
      Fiber.fn.validation.validate(this, val(attributes, this.attributes), options);
      return this.errorBag.getErrors();
    },

    /**
     * Returns validation `rules`
     * @param {Object} defaults
     * @returns {Object}
     */
    getRules: function(defaults) {
      return _.result(this, 'rules', defaults);
    },

    /**
     * Sets validation `rules`
     * @param {Object} rules
     * @returns {Fiber.Model}
     */
    setRules: function(rules) {
      this.rules = rules;
      return this;
    },

    /**
     * Determine if `rules` is not empty
     * @returns {boolean}
     */
    hasRules: function() {
      return ! _.isEmpty(this.rules);
    },

    /**
     * Converts Model to JSON
     * @returns {Object}
     */
    toJSON: function() {
      return _.omit(this._apply(Backbone.Model, 'toJSON'), _.result(this, 'hidden'));
    },

    /**
     * Returns next model.
     * @param {?Object} [options={}]
     * @returns {Fiber.Model|null}
     */
    next: function(options) {
      return this.sibling(_.extend({ direction: 'next' }, options || {}));
    },

    /**
     * Returns previous model.
     * @param {?Object} [options={}]
     * @returns {Fiber.Model|null}
     */
    prev: function(options) {
      return this.sibling(_.extend({ direction: 'prev' }, options || {}));
    },

    /**
     * Returns Sibling Model.
     * @param {?Object} [options={}] direction: next, - direction to search, can be 'next' or 'prev'
     *                               where: null, - options object to find model by, will be passed to
     *                                      the `collection.where`
     *                               defaultCid: null - if no model cid found will be used as default Model cid
     * @returns {Fiber.Model}
     */
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
          else dirCid = models[key + 1].cid;
          break;
        }
        else if (options.direction === 'prev') {
          if (key - 1 < 0) dirCid = _.last(models).cid;
          else dirCid = models[key - 1].cid;
          break;
        }
      }

      return dirCid != null ? this.collection.get(dirCid) : this;
    },

    /**
     * Sets model view
     * @param {Fiber.View} view
     */
    setView: function(view) {
      this.__view = view;
    },

    /**
     * Returns model view
     * @returns {Fiber.View|*|null}
     */
    getView: function() {
      return this.__view;
    },

    /**
     * Determines if model has view
     * @returns {boolean}
     */
    hasView: function() {
      return ! _.isEmpty(this.__view);
    },

    /**
     * Resets view reference
     * @returns {Fiber.Model}
     */
    resetView: function() {
      this.__view = null;
      return this;
    },

    /**
     * Fetches model data
     * @param {Object} options
     * @returns {*}
     */
    fetch: function(options) {
      return this._apply(Backbone.Model, 'fetch', [
        _.extend({}, options || {}, {
          success: this.__whenSuccess.bind(this),
          error: this.__whenError.bind(this)
        })
      ]);
    },

    /**
     * Sends request using jQuery `ajax` method with the given `options`
     * @param {Object} options
     * @returns {*}
     */
    request: function(options) {
      return Fiber.$.ajax(options);
    },

    /**
     * Fetch success handler
     * @param {Object.<Fiber.Model>} model
     * @param {Object} response
     * @param {?Object} [options]
     */
    whenSuccess: function(model, response, options) {},

    /**
     * Fetch error handler
     * @param {Object.<Fiber.Model>} model
     * @param {Object} response
     * @param {?Object} [options]
     */
    whenError: function(model, response, options) {},

    /**
     * Validation error handler
     * @param {Object.<Fiber.Model>} model
     * @param {Object} response
     * @param {?Object} [options]
     */
    whenInvalid: function(model, errors, options) {},

    /**
     * Checks if Model is fetchable
     * @returns {boolean}
     */
    isFetchable: function() {
      try { return _.isString(_.result(this, 'url')); }
      catch (e) { return false; }
    },

    /**
     * Destroys model and also reset view reference
     * @returns {*}
     */
    destroy: function() {
      this.resetView();
      return this._apply(Backbone.Model, 'destroy', arguments);
    },

    /**
     * Private success handler
     * @param {Object.<Fiber.Model>} model
     * @param {Object} response
     * @param {?Object} [options]
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
     * @param {Object.<Fiber.Model>} model
     * @param {Object} response
     * @param {?Object} [options]
     * @private
     */
    __whenError: function(model, response, options) {
      this.whenError.apply(this, arguments);
      this.fire('fetchError', {
        model: model,
        response: response,
        options: options
      });
    },

    /**
     * Private validation error handler
     * @param {Object.<Fiber.Model>} model
     * @param {Object} response
     * @param {?Object} [options]
     * @private
     */
    __whenInvalid: function(model, errors, options) {
      this.whenInvalid.apply(this, arguments);
      if (this.eventsNs) this.fire('invalid', {
        model: model,
        errors: errors,
        options: options
      });
    }
  }
]);
