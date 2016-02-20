// Returns extension if one is found or empty object otherwise
Fiber.getExtension = function(alias) {
  if (_.isArray(alias)) return _.map(alias, function(one) {
    return Fiber.getExtension(one);
  });
  return _.isString(alias) ? val(Fiber.Extensions[alias], {}) : alias;
};

// Adds extension
Fiber.setExtension = function(alias, extension, override) {
  // Allow passing multiple extensions `{'name': extension}`,
  // `override` will go next instead of `extension` argument
  if (_.isPlainObject(alias)) _.each(alias, function(one, oneAlias) {
    Fiber.setExtension(oneAlias, one, extension);
  });
  else {
    if (Fiber.hasExtension(alias) && ! val(override, false)) return;
    Fiber.Extensions[alias] = extension;
  }
  return this;
};

// Checks if Fiber has extension by given `alias`
Fiber.hasExtension = function(alias, method) {
  method = val(method, 'every', _.isString);
  if (_.isArray(alias)) return _[method](alias, function(one) {
    return Fiber.hasExtension(one);
  });
  return _.has(Fiber.Extensions, alias);
};

// Removes extension
Fiber.removeExtension = function(alias) {
  if (! _.isArray(alias)) alias = [alias];
  _.each(alias, function(one) {
    delete Fiber.Extensions[one];
  });
  return this;
};

// Applies extension by `alias` to the given `object`.
// Also you can provide `override` boolean to force override properties.
Fiber.applyExtension = function(alias, object, override) {
  Fiber.fn.class.include(object, Fiber.getExtension(alias), override);
  return this;
};

// Returns all extensions
Fiber.getAllExtensions = function() {
  return Fiber.Extensions;
};

Fiber.getExtensionsList = function(exclude) {
  return _.difference(_.keys(Fiber.Extensions), val(exclude, [], _.isArray));
};
