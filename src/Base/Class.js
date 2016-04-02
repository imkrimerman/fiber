/**
 * Fiber Base Class
 * @class
 */
Fiber.Class = Fiber.fn.class.create([
  Fiber.Events, {

    /**
     * Constructs simple class
     * @param {?Object} [options]
     * @param {?Array|string} [extensions]
     */
    constructor: function(options, extensions) {
      Fiber.fn.class.handleOptions(this, options);
      if (extensions) this.applyExtension(extensions, true);
      Fiber.fn.apply(this, 'initialize', [arguments]);
    },

    /**
     * Applies Fiber extension to the Class
     * @param {string} alias - Extensions alias
     * @param {?boolean} [override] - Force override properties.
     */
    applyExtension: function(alias, override) {
      Fiber.applyExtension(alias, this, override);
      return this;
    }

  }
]);
