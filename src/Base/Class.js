/**
 * Fiber Base Class
 * @class
 * @extends {BaseClass}
 */
Fiber.Class = BaseClass.implement('Events').extend([
  Fiber.Events, {

    /**
     * Class type signature
     * @type {string}
     * @private
     */
    _signature: '[object Fiber.Class]',

    /**
     * Constructs Class
     * @param {Object} [options]
     */
    constructor: function(options) {
      this.initEventProperties();
      this.$superInit(arguments);
    },

    /**
     * Destroys Class
     * @returns {Fiber.Class}
     */
    destroy: function() {
      this.destroyEvents();
      return this;
    }
  }
]);

/**
 * Add Class type to Fiber
 */
Fiber.Types.Class = new Fiber.Type({
  type: 'object',
  signature: Fiber.Class.prototype._signature,
  defaults: Fiber.Class
});
