// Fiber Class constructor.
Fiber.Class = function(options) {
  this.initialize.apply(this, arguments);
};

// Extend Fiber Class prototype
_.extend(Fiber.Class.prototype, Backbone.Events, {

  // Set constructor
  constructor: Fiber.Class,

  // Initialize your class here
  initialize: function() {},

  // Applies Fiber extension to the Class to provide more flexibility
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
  }
});

Fiber.Class.extend = extend;
