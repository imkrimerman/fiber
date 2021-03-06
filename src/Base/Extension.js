/**
 * Fiber Extension
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Extension = Fiber.Class.extend({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  __signature: '[object Fiber.Extension]',

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  __initWith: false,

  /**
   * Extension name
   * @type {string}
   */
  __name: '',

  /**
   * Code capsule
   * @type {Object}
   */
  __code: null,

  /**
   * Constructs extension
   * @param {string} name
   * @param {Object} code
   */
  constructor: function(name, code) {
    this.fromCode(code, name);
    $fn.apply(this, '__init__', arguments);
  },

  /**
   * Sets extension to the capsule
   * @param {Object} code
   */
  setCodeCapsule: function(code) {
    this.__code = code;
  },

  /**
   * Returns code of the extension
   * @returns {Object}
   */
  getCodeCapsule: function() {
    return this.__code;
  },

  /**
   * Determines if extension has valid code capsule
   * @returns {boolean}
   */
  hasCodeCapsule: function() {
    return _.isPlainObject(this.__code);
  },

  /**
   * Returns method name to call when extension is initiating
   * @returns {string|boolean}
   */
  getInitMethod: function() {
    return this.__initWith;
  },

  /**
   * Sets extensions initialize method name
   * @param {string} method
   * @returns {Fiber.Extension}
   */
  setInitMethod: function(method) {
    this.__initWith = method;
    return this;
  },

  /**
   * Determines if extensions has initialize method
   * @returns {boolean}
   */
  hasInitMethod: function() {
    return ! ! this.__initWith;
  },

  /**
   * Returns extension name
   * @returns {string}
   */
  getName: function() {
    return this.__name;
  },

  /**
   * Sets name of the extension
   * @param {string} name
   * @returns {Fiber.Extension}
   */
  setName: function(name) {
    this.__name = name;
    return this;
  },

  /**
   * Determines if extension has name
   * @returns {boolean}
   */
  hasName: function() {
    return ! _.isEmpty(this.__name);
  },

  /**
   * Calls `method` with the given `args`in the `scope`
   * @param {string} method
   * @param {?Array} [args]
   * @param {?Object} [scope]
   * @returns {*}
   */
  call: function(method, args, scope) {
    return $fn.apply(this.getCodeCapsule(), method, args, scope);
  },

  /**
   * Includes current extension to the given `object`
   * @param {Object} object
   * @param {?boolean} [override=false]
   * @returns {*|Object|Function}
   */
  includeTo: function(object, override) {
    return $fn.class.mix(object, this.copy(), override);
  },

  /**
   * Returns cloned `code capsule` object of the extension
   * @returns {Object}
   */
  toCode: function() {
    return this.copy();
  },

  /**
   * Sets code capsule, extension name and initialize method
   * @param {Object} code
   * @param {?string} [name]
   * @param {?string|Function} [initWith]
   * @returns {Fiber.Extension}
   */
  fromCode: function(code, name, initWith) {
    code = $valMerge(code, {initWith: false}, 'defaults');
    initWith = $val(initWith, false, [_.isString, _.isFunction, _.isBoolean]);
    if (_.isString(name)) this.setName(name);
    if (_.isFunction(_.get(code, '__init__'))) this.__init__ = code.__init__;
    this.setCodeCapsule(code);
    this.setInitMethod(initWith || code.initWith || code.__initWith || this.__initWith);
    delete code.initWith;
    delete code.__initWith;
    return this;
  },

  /**
   * Returns copy of the extension code capsule
   * @returns {Object}
   */
  copy: function() {
    return _.clone(this.getCodeCapsule());
  },

  /**
   * Returns property list of the extension code
   * @returns {Array}
   */
  getCodeCapsulePropertyList: function() {
    return $fn.properties(this.getCodeCapsule());
  },

  /**
   * Returns method list of the extension code
   * @returns {Array}
   */
  getCodeCapsuleMethodList: function() {
    return $fn.methods(this.getCodeCapsule());
  },

  /**
   * Returns all code capsule keys list
   * @returns {Array}
   */
  getCodeCapsuleKeysList: function() {
    return _.keys(this.getCodeCapsule());
  }
});

/**
 * Add Extension type to Fiber
 */
Fiber.Types.Extension = new Fiber.Type({
  type: 'object',
  signature: Fiber.Extension.prototype.__signature,
  defaults: Fiber.Extension
});
