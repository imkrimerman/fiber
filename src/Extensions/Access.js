// Access extension brings getters, setters and unsetters that uses
// `lodash` methods to support deep access to the Class.
Fiber.setExtension('Access', {

  // Gets value by given `property` key. You can provide `defaults` value that
  // will be returned if value is not found by the given key. If `defaults` is
  // not provided that defaults will be set to `null`
  get: function(property, defaults) {
    return Fiber.fn.get(this, property, defaults);
  },

  // Sets `value` by given `property` key
  set: function(property, value) {
    Fiber.fn.set(this, property, value);
    return this;
  },

  // Checks if Class has given `property`
  has: function(property) {
    return Fiber.fn.has(this, property);
  },

  // Gets value by given `property` key, if `property` value is function then it will be called.
  // You can provide `defaults` value that will be returned if value is not found
  // by the given key. If `defaults` is not provided that defaults will be set to `null`
  result: function(property, defaults) {
    return Fiber.fn.result(this, property, defaults);
  },

  // Removes `value` by given `property` key
  forget: function(property) {
    Fiber.fn.forget(this, property);
    return this;
  }
});
