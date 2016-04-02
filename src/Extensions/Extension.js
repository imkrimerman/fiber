/**
 * Fiber Extension
 * @class
 */
Fiber.Extension = Fiber.fn.class.createClass({

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initMethod: false,

  /**
   * Constructs extension
   * @param {Object} delegatable
   */
  constructor: function(delegatable) {
    this.__delegatable = delegatable;
  },

  /**
   * Sets code of extension
   * @param delegateble
   */
  set code (delegateble) {
    this.__delegatable = delegateble;
  },

  /**
   * Returns code of the extension
   * @returns {Object}
   */
  get code () {
    return this.__delegatable;
  },

  /**
   * Binds extension `code` to the `object`
   * @param {Object} object
   * @return {Object}
   */
  bindTo: function(object) {
    var clone = this.clone();
    _.each(this.code, _.bind(function(method, name) {
      clone[name] = _.bind(method, object);
    }, this));
    return clone;
  },

  /**
   * Return clone of the extension
   * @returns {Object}
   */
  clone: function() {
    return _.cloneDeep(this.code);
  },

  /**
   * Returns method name to call when extension is initiating
   * @returns {string|boolean}
   */
  getInitMethodName: function() {
    return this.initMethod;
  },

});
