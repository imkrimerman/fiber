// Returns extension if one is found or empty object otherwise
Fiber.getExtension = function(alias) {
  if (_.isArray(alias)) return _.map(alias, function(one) {
    return Fiber.getExtension(one);
  });
  return _.isString(alias) ? val(this.Extension[alias], {}) : alias;
};

// Adds extension
Fiber.addExtension = function(alias, extension, override) {
  if (_.isArray(alias)) _.each(alias, function(one) {
    Fiber.addExtension(one);
  }, this);
  else {
    if (this.Extension.hasOwnProperty(alias) && ! val(override, false)) return;
    this.Extension[alias] = extension;
  }
  return this;
};

// Removes extension
Fiber.removeExtension = function(alias) {
  if (! _.isArray(alias)) alias = [alias];
  _.each(alias, function(one) {
    delete this.Extension[one];
  }.bind(this));
  return this;
};

// Applies extension by `alias` to the given `object`.
// Also you can provide `override` boolean to force override properties.
Fiber.applyExtension = function(alias, object, override) {
  this.getExtension('Mixin').include(this.getExtension(alias), object, override);
  return this;
};
