/**
 * Base Collection, used internally
 * @class
 * @extends {Backbone.Collection}
 */
var Collection = Fiber.fn.class.extend(Backbone.Collection, [
  $Extend.getCodeCapsule(), $OwnProps.getCodeCapsule(), $Binder.getCodeCapsule(), {

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function}
   */
  willExtend: ['model', 'url'],

  /**
   * Constructor
   * @param {Object[]|Array} models - Model to construct with
   * @param {?Object} [options] - Options to extend from
   */
  constructor: function(models, options) {
    this.applyExtend(options);
    this.applyOwnProps();
    this.applyBinder();
    this.__parent__.apply(this, arguments);
  },

  /**
   * Flushes history
   * @returns {Collection}
   */
  flush: function() {
    this.reset([]);
    return this;
  },
}]);
