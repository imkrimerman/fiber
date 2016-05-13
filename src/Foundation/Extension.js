/**
 * Fiber Extension
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Extension = Fiber.Class.extend({

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  _initWith: false,

  /**
   * Extension name
   * @type {string}
   */
  _name: '',

  /**
   * Code capsule
   * @type {Object}
   */
  _code: null,

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Extension]',

  /**
   * Constructs extension
   * @param {string} name
   * @param {Object} code
   */
  constructor: function(name, code) {
    $fn.expect(_.isString(name));
    this.resetEventProperties();
    this.fromCode(code, name);
    $fn.apply(this, '_init_', arguments);
  },

  /**
   * Sets extension code capsule with the given `code`
   * @param {Object} code
   * @return {Fiber.Extension}
   */
  setCode: function(code) {
    this._code = code;
    return this;
  },

  /**
   * Returns code capsule of the extension
   * @returns {Object}
   */
  getCode: function() {
    return this._code;
  },

  /**
   * Determines if extension has valid code capsule
   * @returns {boolean}
   */
  hasCode: function() {
    return _.isPlainObject(this._code);
  },

  /**
   * Returns method name to call when extension is initiating
   * @returns {string|boolean}
   */
  getInitMethod: function() {
    return this._initWith;
  },

  /**
   * Sets extensions initialize method name
   * @param {string} method
   * @returns {Fiber.Extension}
   */
  setInitMethod: function(method) {
    this._initWith = method;
    return this;
  },

  /**
   * Determines if extensions has initialize method
   * @returns {boolean}
   */
  hasInitMethod: function() {
    return ! ! this._initWith;
  },

  /**
   * Returns extension name
   * @returns {string}
   */
  getName: function() {
    return this._name;
  },

  /**
   * Sets name of the extension
   * @param {string} name
   * @returns {Fiber.Extension}
   */
  setName: function(name) {
    this._name = name;
    return this;
  },

  /**
   * Determines if extension has name
   * @returns {boolean}
   */
  hasName: function() {
    return ! _.isEmpty(this._name);
  },

  /**
   * Calls `method` with the given `args`in the `scope`
   * @param {string} method
   * @param {?Array} [args]
   * @param {?Object} [scope]
   * @returns {*}
   */
  call: function(method, args, scope) {
    return $fn.apply(this.getCode(), method, args, scope);
  },

  /**
   * Includes current extension to the given `object`
   * @param {Object} object
   * @param {?boolean} [override=false]
   * @returns {*|Object|function()}
   */
  includeTo: function(object, override) {
    return $fn.class.mix(object, this.copy(), override);
  },

  /**
   * Sets code capsule, extension name and initialize method
   * @param {Object} code
   * @param {?string} [name]
   * @param {?string|function()} [initWith]
   * @returns {Fiber.Extension}
   */
  fromCode: function(code, name, initWith) {
    code = $valMerge(code, {initWith: false}, 'defaults');
    initWith = $val(initWith, false, [_.isString, _.isFunction, _.isBoolean]);
    if (_.isString(name)) this.setName(name);
    if (_.isFunction($fn.get(code, '_init_'))) this._init_ = code._init_;
    this.setCode(code);
    this.setInitMethod(initWith || code.initWith || this._initWith);
    $fn.forget(code, ['initWith', '_init_']);
    return this;
  },

  /**
   * Returns cloned `code capsule` object of the extension
   * @returns {Object}
   */
  toCode: function() {
    return this.copy();
  },

  /**
   * Returns copy of the extension code capsule
   * @returns {Object}
   */
  copy: function() {
    return $fn.clone(this.getCode());
  },

  /**
   * Returns property list of the extension code
   * @returns {Array}
   */
  getCodeProperties: function() {
    return $fn.properties(this.getCode());
  },

  /**
   * Returns method list of the extension code
   * @returns {Array}
   */
  getCodeMethods: function() {
    return $fn.methods(this.getCode());
  },

  /**
   * Returns all code capsule keys list
   * @returns {Array}
   */
  getCodeKeys: function() {
    return _.keys(this.getCode());
  }
});

/**
 * Add Extension type to Fiber
 */
Fiber.Types.Extension = new Fiber.Type({
  type: 'object',
  signature: Fiber.Extension.prototype._signature,
  defaults: Fiber.Extension
});
