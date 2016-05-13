/**
 * Fiber Model
 * @class
 * @extends {BaseModel}
 */
Fiber.Model = BaseModel.extend({

  /**
   * Hidden fields.
   * toJSON method will omit this fields.
   * @type {Array|function()}
   */
  hidden: [],

  /**
   * Validation rules
   * @type {Object|function()}
   */
  rules: {},

  /**
   * Error bag
   * @type {Object.<Fiber.ErrorBag>}
   */
  errorBag: null,

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|function()}
   */
  willExtend: ['collection', 'url', 'hidden', 'rules', 'eventsConfig'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function()}
   */
  ownProps: ['hidden', 'rules', 'eventsConfig'],

  /**
   * Constructs Model
   * @param {?Object} [attributes={}]
   * @param {?Object} [options={}]
   */
  constructor: function(attributes, options) {
    attributes = $val(attributes, {});
    options = $fn.class.handleOptions(this, options);

    this.attributes = {};
    this.cid = _.uniqueId(this.cidPrefix + '-');
    this.errorBag = new Fiber.ErrorBag();
    this.resetView();

    $fn.extensions.init(this);

    if (options.parse) attributes = this.parse(attributes, options) || {};
    attributes = _.defaultsDeep({}, attributes, $fn.result(this, 'defaults'));

    this.set(attributes, options);
    this.changed = {};

    this.when('invalid', function() {
      $fn.apply(this, 'whenInvalid', arguments);
    });

    $fn.apply(this, 'initialize', arguments);
  },

  /**
   * Get the value of an attribute.
   * If computed property is available then it will be retrieved.
   * @param {string} attribute
   * @param {?Object} [options]
   * @returns {*}
   */
  get: function(attribute, options) {
    options = $valMerge(options, {denyCompute: false}, 'defaults');
    if (! options.denyCompute && $fn.computed.has(this, attribute, 'get'))
      return $fn.computed.get(this, attribute);
    return $fn.get(this.attributes, attribute);
  },

  /**
   * Set a hash of model attributes on the object.
   * If computed property is available then it will be called with new value.
   * @param {Object|string} attribute
   * @param {*} value
   * @param {?Object} [options]
   * @returns {*}
   */
  set: function(attribute, value, options) {
    options = $valMerge(options, {denyCompute: false}, 'defaults');
    if (! options.denyCompute && $fn.computed.has(this, attribute, 'set'))
      return $fn.computed.set(this, attribute, value);
    return this.$super('set', arguments);
  },

  /**
   * Returns `true` if the attribute contains a value that is not null or undefined.
   * First it will check if computed property is available then it will check if
   * @param {string} attribute
   * @returns {boolean}
   */
  has: function(attribute, options) {
    options = $valMerge(options, {denyCompute: false}, 'defaults');
    if (! options.denyCompute && $fn.computed.has(this, attribute, 'get')) return true;
    return $fn.has(this.attributes, attribute);
  },

  /**
   * Validates `attributes` of Model against `rules`
   * @param {?Object} [attributes=this.attributes]
   * @param {?Object} [options={}]
   * @returns {Object|undefined}
   */
  validate: function(attributes, options) {
    $fn.validation.validate(this, $val(attributes, this.attributes), options);
    return this.errorBag.getErrors();
  },

  /**
   * Returns validation `rules`
   * @param {Object} defaults
   * @returns {Object}
   */
  getRules: function(defaults) {
    return $fn.result(this, 'rules', defaults);
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
   * Serializes model
   * @returns {Object}
   */
  serialize: function() {
    return $fn.serialize(this.attributes);
  },

  /**
   * Converts Model to JSON
   * @returns {Object}
   */
  toJSON: function(options) {
    options = $valMerge(options, {hide: true}, 'defaults');
    var jsonModel = this.serialize();
    if (options.hide) return _.omit(jsonModel, $fn.result(this, 'hidden'));
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
    this._view = view;
  },

  /**
   * Returns model view
   * @returns {Fiber.View|*|null}
   */
  getView: function() {
    return this._view;
  },

  /**
   * Determines if model has view
   * @returns {boolean}
   */
  hasView: function() {
    return ! _.isEmpty(this._view);
  },

  /**
   * Resets view reference
   * @returns {Fiber.Model}
   */
  resetView: function() {
    this._view = null;
    return this;
  },

  /**
   * Checks if Model is can be synced with the server
   * @returns {boolean}
   */
  isSyncable: function() {
    try { return _.isString($fn.result(this, 'url')); }
    catch (e) { return false; }
  },

  /**
   * Destroys model and also reset view reference
   * @returns {*}
   */
  destroy: function() {
    this.resetView();
    this.destroyEvents();
    return this.$super('destroy', arguments);
  },
});
