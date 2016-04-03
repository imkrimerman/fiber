/**
 * Fiber Base Class
 * @class
 */
Fiber.Class = Fiber.fn.class.create([
  Fiber.Events, $Extensions.getCode(), {

    /**
     * Constructs simple class
     * @param {?Object} [options]
     * @param {?Array|string} [extensions]
     */
    constructor: function(options, extensions) {
      Fiber.fn.class.handleOptions(this, options);
      Fiber.fn.class.setExtensions(this, extensions);
      Fiber.initializeExtensions(this, null, extensions);
      Fiber.fn.apply(this, 'initialize', [arguments]);
    },

    /**
     * Includes Fiber extension to the Class
     * @param {string} alias - Extensions alias
     * @param {?boolean} [override=false] - Force override properties.
     */
    includeExtension: function(alias, override) {
      Fiber.applyExtension(alias, this, override);
      return this;
    },

  }
]);
