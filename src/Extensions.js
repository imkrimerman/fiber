// Returns extension if one is found or empty object otherwise
Fiber.getExtension = function(alias) {
  if (_.isArray(alias)) return _.map(alias, function(one) {
    return Fiber.getExtension(one);
  });
  return _.isString(alias) ? val(this.Extension[alias], {}) : alias;
};

// Adds extension
Fiber.setExtension = function(alias, extension, override) {
  // Allow passing multiple extensions `{'name': extension}`,
  // `override` will go next instead of `extension` argument
  if (_.isPlainObject(alias)) _.each(alias, function(one, oneAlias) {
    Fiber.setExtension(oneAlias, one, extension);
  }, this);
  else {
    if (this.Extension.hasOwnProperty(alias) && ! val(override, false)) return;
    this.Extension[alias] = extension;
  }
  return this;
};

// Checks if Fiber has extension by given `alias`
Fiber.hasExtension = function(alias) {
  if (_.isArray(alias)) return _.every(alias, function(one) {
    return Fiber.hasExtension(one);
  });
  return this.Extension.hasOwnProperty(alias);
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
  Fiber.fn.include(object, this.getExtension(alias), override);
  return this;
};
