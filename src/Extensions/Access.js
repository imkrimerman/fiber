// Access extension brings getters, setters and unsetters that uses
// `lodash` methods to support deep access to the Class.
Fiber.setExtension('Access', {

  // Gets value by given `property` key. You can provide `defaults` value that
  // will be returned if value is not found by the given key. If `defaults` is
  // not provided that defaults will be set to `null`
  get: function(property, defaults) {
    return _.get(this, property, val(defaults, null));
  },

  // Sets `value` by given `property` key
  set: function(property, value) {
    _.set(this, property, value);
    return this;
  },

  // Checks if Class has given `property`
  has: function(property) {
    return _.has(this, property);
  },

  // Gets value by given `property` key, if `property` value is function then it will be called.
  // You can provide `defaults` value that will be returned if value is not found
  // by the given key. If `defaults` is not provided that defaults will be set to `null`
  result: function(property, defaults) {
    return _.result(this, property, val(defaults, null));
  },

  // Removes `value` by given `property` key
  forget: function(property) {
    _.unset(this, property);
    return this;
  }
});
