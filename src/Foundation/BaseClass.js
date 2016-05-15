/**
 * Base Class
 * @class
 * @extends {Backbone.Events}
 * @private
 */
var BaseClass = $fn.class.create([
  Backbone.Events, {

    /**
     * Class type signature
     * @type {string}
     * @private
     */
    _signature: '[object Fiber.BaseClass]',

    /**
     * Constructs base class
     * @param {Object} [options]
     */
    constructor: $fn.class.createConstructor(),

    /**
     * Destroys Class
     * @returns {BaseClass}
     */
    destroy: function() {
      $fn.apply(this, 'destroyEvents');
      return this;
    }
  }
]);
