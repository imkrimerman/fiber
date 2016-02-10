// Fiber Class constructor.
Fiber.Class = function(options) {
  options = val(options, {});
  if (options.extensions)
    Fiber.applyExtension(options.extensions, this, true);
  this.initialize.apply(this, arguments);
};

// Extend Fiber Class prototype
_.extend(Fiber.Class.prototype, Backbone.Events, {

  // Initialize your class here
  initialize: function() {},

  // Applies Fiber extension to the Class to provide more flexibility
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
  }
});

Fiber.Class.extend = extend;
