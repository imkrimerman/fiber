/**
 * Fiber Model
 * @class
 * @extends {BaseModel}
 */
Fiber.Model = BaseModel.extend({

  /**
   * The prefix is used to create the client id which is used to identify models locally.
   * @type {string|function(...)|null}
   */
  cidPrefix: 'model',

  /**
   * Model unique client identifier.
   * @type {string|number|function(...)}
   * @private
   */
  cidId: function() {return _.uniqueId();},

  /**
   * Hidden fields.
   * toJSON method will omit this fields.
   * @type {Array|function(...)}
   */
  hidden: [],

  /**
   * Validation rules.
   * @type {Object|function(...)}
   */
  rules: {},

  /**
   * Error bag.
   * @type {Object.<Fiber.ErrorBag>}
   */
  errorBag: null,

  /**
   * Properties keys that will be auto extended from initialize object.
   * @type {Array|function(...)}
   */
  willExtend: ['url', 'hidden', 'rules', 'eventsConfig'],

  /**
   * Properties keys that will be owned by the instance.
   * @type {Array|function(...)}
   */
  ownProps: ['hidden', 'rules', 'eventsConfig'],

  /**
   * Class type signature.
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Model]',

  /**
   * Constructs Model.
   * @param {?Object} [attributes={}]
   * @param {?Object} [options={}]
   */
  constructor: function(attributes, options) {
    this.attributes = {};
    this.errorBag = new Fiber.ErrorBag();
    this.adapter = new Fiber.Repository();
    attributes = $val(attributes, {}, _.isPlainObject);
    options = $fn.class.handleOptions(this, options);
    this.createClientId();
    this.flushView();
    if (options.adapter) this.adapter = options.adapter;
    if (options.parse) attributes = $val(this.parse(attributes, options), {}, _.isPlainObject);
    attributes = _.defaultsDeep({}, attributes, $fn.result(this, 'defaults'));
    this.set(attributes, options);
    this.changed = {};
    this.when('invalid', function() {$fn.apply(this, 'whenInvalid', arguments);});
    $fn.extensions.init(this);
    $fn.apply(this, 'initialize', arguments);
  },

  /**
   * Returns created client identifier of the Model.
   * @returns {string|number}
   */
  createClientId: function() {
    return this.cid = $fn.result(this, 'cidPrefix') + $fn.result(this, 'cidId');
  },

  /**
   * Get the value of an attribute.
   * If computed property is available then it will be retrieved.
   * @param {string} attribute
   * @param {?Object} [options]
   * @returns {*}
   */
  get: function(attribute, options) {
    options = $valMerge(options, { compute: true }, 'defaults');
    if (options.compute && $fn.computed.has(this, attribute, 'get'))
      return $fn.computed.get(this, attribute);
    return $fn.get(this.attributes, attribute);
  },

  /**
   * Set a hash of model attributes on the object.
   * If computed property is available then it will be called with new value.
   * @param {Object|string} attribute
   * @param {*} [value]
   * @param {?Object} [options]
   * @returns {*}
   */
  set: function(attribute, value, options) {
    options = $valMerge(options, { compute: true }, 'defaults');
    if (options.compute && $fn.computed.has(this, attribute, 'set'))
      return $fn.computed.set(this, attribute, value);
    return this.$super('set', arguments);
  },

  /**
   * Returns `true` if the attribute contains a value that is not null or undefined.
   * Checks if is computed property then will resolve computed method and will use it.
   * @param {string} attribute
   * @param {Object} [options]
   * @returns {boolean}
   */
  has: function(attribute, options) {
    options = $valMerge(options, { compute: true }, 'defaults');
    if (options.compute) return $fn.computed.has(this, attribute, 'get');
    return $fn.has(this.attributes, attribute);
  },

  /**
   * Return direct reference to the Model attributes.
   * @param {boolean} [deep=false]
   * @returns {Object}
   */
  all: function(deep) {
    return $fn.clone(this.attributes, deep);
  },

  /**
   * Validates `attributes` of Model against `rules`.
   * @param {Object} [attributes=this.attributes]
   * @param {Object} [options]
   * @returns {Object|undefined}
   */
  validate: function(attributes, options) {
    return $fn.validation.validate(this, attributes, options);
  },

  /**
   * Returns validation `rules`.
   * @returns {Object}
   */
  getRules: function() {
    return $fn.result(this, 'rules');
  },

  /**
   * Sets validation `rules`.
   * @param {Object} rules
   * @returns {Fiber.Model}
   */
  setRules: function(rules) {
    this.rules = rules;
    return this;
  },

  /**
   * Determine if `rules` is not empty.
   * @returns {boolean}
   */
  hasRules: function() {
    return ! _.isEmpty(this.getRules());
  },

  /**
   * Returns next model.
   * @param {?Object} [options={}]
   * @returns {Fiber.Model|null}
   */
  next: function(options) {
    return this.sibling($fn.merge({ direction: 'next' }, options || {}));
  },

  /**
   * Returns previous model.
   * @param {?Object} [options={}]
   * @returns {Fiber.Model|null}
   */
  prev: function(options) {
    return this.sibling($fn.merge({ direction: 'prev' }, options || {}));
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
    return $fn.modelSibling(this, options);
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
   * Resets view reference to `null`
   * @returns {Fiber.Model}
   */
  flushView: function() {
    this._view = null;
    return this;
  },

  /**
   * Serializes model attributes to string.
   * @returns {string}
   */
  serialize: function() {
    return $fn.serialize.stringify(this.attributes);
  },

  /**
   * Sets Model attributes from serialized string.
   * @param {string} serialized
   * @returns {Fiber.Model}
   */
  fromSerialized: function(serialized) {
    if (_.isString(serialized)) serialized = $fn.serialize.parse(serialized);
    if (_.isPlainObject(serialized)) this.set(serialized);
    return this;
  },

  /**
   * Converts Model to JSON hash that can be stringified later.
   * @returns {Object}
   */
  toJSON: function(options) {
    options = $valMerge(options, { hidden: true }, 'defaults');
    var jsonModel = this.all();
    if (! options.hidden) return jsonModel;
    return _.omit(jsonModel, $fn.result(this, 'hidden'));
  },

  /**
   * Sets Model attributes from JSON hash or string.
   * @param {string|Object} json
   * @returns {Fiber.Model}
   */
  fromJSON: function(json) {
    if (_.isString(json)) json = JSON.parse(json);
    if (_.isPlainObject(json)) this.set(json);
    return this;
  },

  /**
   * Destroys model and also reset view reference
   * @returns {*}
   */
  destroy: function() {
    this.flushView();
    this.destroyEvents();
    return this.$super('destroy', arguments);
  },

  /**
   * Checks if Model is can be synced with the server
   * @returns {boolean}
   */
  isSyncable: function() {
    try { return _.isString($fn.result(this, 'url')); }
    catch (e) { return false; }
  }
});

/**
 * Add Model type to Fiber
 */
Fiber.Types.Model = new Fiber.Type({
  type: 'object',
  signature: Fiber.Model.prototype._signature,
  example: function() {return new Fiber.Model;}
});
