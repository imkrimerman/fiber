// Mixin extension.
// Functions that provides including and mixining objects and array of objects

Fiber.addExtension('Mixin', {

  // Includes `mixin` or array of mixins to Fiber Class.
  // Also you can provide `override` boolean to force override properties.
  include: function(mixin, override) {
    return Fiber.fn.include(this, mixin, override);
  },

  // Adds given `mixin` to Fiber Class. Mixin can be object or function.
  // Also you can provide `override` boolean to force override properties.
  mix: function(mixin, override) {
    return Fiber.fn.mix(this, mixin, override);
  },

  // Mixes Fiber Class to given `object`.
  // Also you can provide `override` boolean to force override properties.
  mixTo: function(object, override) {
    Fiber.fn.mix(object, this, override);
  },

  // Applies Fiber extension to the Class to provide more flexibility
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
  }
});
