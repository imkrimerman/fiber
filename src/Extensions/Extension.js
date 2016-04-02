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
   * Constructs extension
   * @param {Object} delegatable
   * @param {string|boolean} initMethod
   */
  constructor: function(code, initMethod) {
    this.setCapsule(code);
    this.initMethod = initMethod || this.initMethod;
  },

  /**
   * Sets extension to the capsule
   * @param {Object} code
   */
  setCapsule: function(code) {
    this.__delegatable = code;
  },

  /**
   * Returns code of the extension
   * @returns {Object}
   */
  getCapsule: function() {
    return this.__delegatable;
  },

  /**
   * Binds extension `code` to the `object`
   * @param {Object} object
   * @return {Object}
   */
  bindTo: function(object) {
    var clone = this.clone();
    _.each(this.getCapsule(), _.bind(function(method, name) {
      clone[name] = _.bind(method, object);
    }, this));
    return clone;
  },

  /**
   * Return clone of the extension
   * @returns {Object}
   */
  clone: function() {
    return _.clone(this.getCapsule());
  },

  /**
   * Returns method name to call when extension is initiating
   * @returns {string|boolean}
   */
  getInitMethodName: function() {
    return this.initMethod;
  },

});
