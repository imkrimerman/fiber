/**
 * Fiber Class
 * @class
 * @type {Function}
 * @memberof Fiber#
 */
Fiber.Class = function(options, extensions) {
  if (extensions) Fiber.applyExtension(extensions, this, true);
  this.initialize.apply(this, arguments);
};

/**
 * Extends Fiber Class prototype with Backbone.Events and support helpers
 * @memberof Fiber#
 */
_.extend(Fiber.Class.prototype, Backbone.Events, Fiber.fn.proto(), {

  /**
   * Initializes class
   * @memberof Fiber.Class#
   */
  initialize: function() {},

  /**
   * Applies Fiber extension to the Class
   * @param {string} alias - Extension alias
   * @param {?boolean} [override] - Force override properties.
   * @memberof Fiber.Class#
   */
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
    return this;
  }
});

/**
 * Extend method
 * @var {Function}
 * @memberof Fiber.Class
 * @static
 */
Fiber.Class.extend = Fiber.fn.class.extend;
