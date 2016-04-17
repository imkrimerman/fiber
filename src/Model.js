/**
 * Fiber Model
 * @class
 * @extends {Backbone.Model}
 */
Fiber.Model = Fiber.fn.class.make(Backbone.Model, [
  'Extend', 'Extensions', 'OwnProps', 'Binder', {

    /**
     * Hidden fields.
     * toJSON method will omit this fields.
     * @type {Array|Function}
     */
    hidden: [],

    /**
     * Validation rules
     * @type {Object|Function}
     */
    rules: {},

    /**
     * Error bag
     * @type {Object.<Fiber.ErrorBag>}
     */
    errorBag: null,

    /**
     * Properties keys that will be auto extended from initialize object
     * @type {Array|Function}
     */
    willExtend: ['collection', 'url', 'hidden', 'rules', 'ns', 'catalog'],

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|Function}
     */
    ownProps: ['hidden', 'rules'],

    /**
     * Constructs Model
     * @param {?Object} [attributes={}]
     * @param {?Object} [options={}]
     */
    constructor: function(attributes, options) {
      options = Fiber.fn.class.handleOptions(this, options);
      this.attributes = {};
      this.cid = _.uniqueId(this.cidPrefix + '-');
      this.errorBag = new Fiber.ErrorBag();
      this.resetView();

      attributes = val(attributes, {});
      options = val(options, {});

      Fiber.initializeExtensions(this);
      if (options.parse) attributes = this.parse(attributes, options) || {};

      attributes = _.defaultsDeep({}, attributes, _.result(this, 'defaults'));
      this.set(attributes, options);

      this.changed = {};

      this.listenTo(this, 'invalid', function() {
        Fiber.fn.apply(this, 'whenInvalid', arguments);
      });

      Fiber.fn.apply(this, 'initialize', arguments);
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
    toJSON: function(options) {
      options = _.defaults({}, val(options, {}, _.isPlainObject), {removeHidden: true});
      var jsonModel = this.apply(Backbone.Model, 'toJSON', [options]);
      if (options.removeHidden) return _.omit(jsonModel, _.result(this, 'hidden'));
      return jsonModel;
    },

    /**
     * Returns next model.
     * @param {?Object} [options={}]
     * @returns {Fiber.Model|null}
     */
    next: function(options) {
      return this.sibling(_.extend({direction: 'next'}, options || {}));
    },

    /**
     * Returns previous model.
     * @param {?Object} [options={}]
     * @returns {Fiber.Model|null}
     */
    prev: function(options) {
      return this.sibling(_.extend({direction: 'prev'}, options || {}));
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
     * Sends request using jQuery `ajax` method with the given `options`
     * @param {Object} options
     * @returns {*}
     */
    request: function(options) {
      return Fiber.$.ajax(options);
    },

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
      return this.apply(Backbone.Model, 'destroy', arguments);
    },
  }
]);
