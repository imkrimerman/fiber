/**
 * Fiber Base Collection, used internally
 * @class
 * @extends {Backbone.Collection}
 */
var BaseCollection = Fiber.fn.class.extend(Backbone.Collection, [
  $Extend, $OwnProps, {

    /**
     * Properties keys that will be auto extended from initialize object
     * @type {Array|Function}
     */
    extendable: ['model', 'url', 'ns', 'catalog'],

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|Function}
     */
    ownProp: ['ns', 'catalog'],

    /**
     * Constructor
     * @param {Object[]|Array} models - Model to construct with
     * @param {?Object} [options] - Options to extend from
     */
    constructor: function(models, options) {
      Fiber.initializeExtensions(this);
      this.__parent__.apply(this, arguments);
    },

    /**
     * Flushes history
     * @returns {BaseCollection}
     */
    flush: function() {
      this.reset([]);
      return this;
    },
  }
]);
