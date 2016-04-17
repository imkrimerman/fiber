/**
 * Fiber Extension
 * @class
 */
Fiber.Extension = Fiber.fn.class.create({

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initMethod: false,

  /**
   * Extension name
   * @type {string}
   */
  name: '',

  /**
   * Constructs extension
   * @param {string} name
   * @param {Object} code
   * @param {string|boolean} initMethod
   */
  constructor: function(name, code) {
    this.setName(name);
    this.setCode(code);
    this.setInitMethod(code.initMethod || this.initMethod);
    delete code.initMethod;
  },

  /**
   * Sets extension to the capsule
   * @param {Object} code
   */
  setCode: function(code) {
    this.__code = code;
  },

  /**
   * Returns code of the extension
   * @returns {Object}
   */
  getCode: function() {
    return this.__code;
  },

  /**
   * Returns method name to call when extension is initiating
   * @returns {string|boolean}
   */
  getInitMethod: function() {
    return this.initMethod;
  },

  /**
   * Sets extensions initialize method name
   * @param {string} method
   * @returns {Fiber.Extension}
   */
  setInitMethod: function(method) {
    this.initMethod = method;
    return this;
  },

  /**
   * Returns extension name
   * @returns {string}
   */
  getName: function() {
    return this.name;
  },

  /**
   * Sets name of the extension
   * @param {string} name
   * @returns {Fiber.Extension}
   */
  setName: function(name) {
    this.name = name;
    return this;
  },

  /**
   * Binds extension `code` to the `object`
   * @param {Object} object
   * @param {?string} [attribute]
   * @return {*}
   */
  bindTo: function(object, attribute) {
    this.includeTo(object);
    return _.each(this.getCodeMethodList(), function(method) {
      return Fiber.fn.delegator.delegate(object, method, attribute);
    });
  },

  /**
   * Includes current extension to the given `object`
   * @param {Object} object
   * @param {?boolean} [override=false]
   * @returns {*|Object|Function}
   */
  includeTo: function(object, override) {
    return Fiber.fn.class.mix(object, this.toCode(), override);
  },

  /**
   * Calls `method` with the given `args`in the `scope`
   * @param {string} method
   * @param {?Array} [args]
   * @param {?Object} [scope]
   * @returns {*}
   */
  applyMethod: function(method, args, scope) {
    return Fiber.fn.apply(this.getCode(), method, args, scope);
  },

  /**
   * Returns cloned `code` object of the extension
   * @returns {Object}
   */
  toCode: function() {
    return _.clone(this.getCode());
  },

  /**
   * Returns property list of the extension code
   * @returns {Array}
   */
  getCodePropertyList: function() {
    var properties = [], code = this.getCode();
    _.each(code, function(prop) {
      if (! _.isFunction(code[prop])) properties.push(prop);
    });
    return properties;
  },

  /**
   * Returns method list of the extension code
   * @returns {Array}
   */
  getCodeMethodList: function() {
    return _.values(_.omit(this.getCode(), this.getCodePropertyList()));
  },
});
