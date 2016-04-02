/**
 * Fiber Base Collection, used internally
 * @class
 * @extends {Backbone.Collection}
 */
var BaseCollection = Fiber.fn.class.make(Backbone.Collection, [
  'Extend', 'OwnProps', {

    /**
     * Properties keys that will be auto extended from initialize object
     * @var {Array|Function}
     */
    extendable: ['model', 'url', 'ns', 'catalog'],

    /**
     * Properties keys that will be owned by the instance
     * @var {Array|Function}
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
