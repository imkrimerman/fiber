/**
 * @class Fiber Base Class
 */
Fiber.Class = function(options, extensions) {
  if (extensions) Fiber.applyExtension(extensions, this, true);
  this.initialize.apply(this, arguments);
};

/**
 * Extends Fiber Class prototype with Backbone.Events and support helpers
 */
_.extend(Fiber.Class.prototype, Backbone.Events, Fiber.fn.proto(), {

  /**
   * Initializes class
   */
  initialize: function() {},

  /**
   * Applies Fiber extension to the Class
   * @param {string} alias - Extension alias
   * @param {?boolean} [override] - Force override properties.
   */
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
    return this;
  }
});

/**
 * Extend method
 * @var {Function}
 * @static
 */
Fiber.Class.extend = Fiber.fn.proxy(Fiber.fn.class.extend);
