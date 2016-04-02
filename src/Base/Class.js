/**
 * Fiber Base Class
 * @class
 */
Fiber.Class = Fiber.fn.class.createClass([Backbone.Events, {

  /**
   * Constructs simple class
   * @param {?Object} [options]
   * @param {?Array|string} [extensions]
   */
  constructor: function(options, extensions) {
    if (extensions) Fiber.applyExtension(extensions, this, true);
    this.initialize.apply(this, arguments);
  },

  /**
   * Initializes class
   */
  initialize: function() {},

  /**
   * Applies Fiber extension to the Class
   * @param {string} alias - Extensions alias
   * @param {?boolean} [override] - Force override properties.
   */
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
    return this;
  }

}]);
