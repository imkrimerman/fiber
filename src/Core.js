/**
 * Returns extension if one is found or empty object otherwise
 * @param {Array|string} alias
 * @returns {Array|string}
 */
Fiber.getExtension = function(alias) {
  if (_.isArray(alias)) return _.map(_.castArray(alias), function(one) {
    return Fiber.getExtension(one);
  });
  return _.isString(alias) ? Fiber.container.extensions.get(alias, {}) : alias;
};

/**
 * Adds extension
 * @param {Object|string} alias
 * @param {Object|Function} [extension]
 * @param {?boolean} [override=false]
 * @returns {Fiber}
 */
Fiber.addExtension = function(alias, extension, override) {
  if (_.isPlainObject(alias)) _.each(alias, function(one, oneAlias) {
    // Allow passing multiple extensions `{'name': extension}`,
    // `override` will go next instead of `extension` argument
    Fiber.addExtension(oneAlias, one, extension);
  });
  else {
    if (Fiber.hasExtension(alias) && ! val(override, false)) return this;
    Fiber.container.extensions.set(alias, extension);
  }
  return this;
};

/**
 * Sets extension, overrides if it was already set
 * @param {Object|string} alias
 * @param {Object|Function} extension
 * @returns {Fiber}
 */
Fiber.setExtension = function(alias, extension) {
  return Fiber.addExtension(alias, extension, true);
};

/**
 * Determine if Fiber has extension by given `alias`
 * @param {Array|string} alias
 * @param {?string} [method=every]
 * @returns {boolean}
 */
Fiber.hasExtension = function(alias, method) {
  method = val(method, 'every', _.isString);
  if (_.isArray(alias)) return _[method](alias, function(one) {
    return Fiber.hasExtension(one);
  });
  return Fiber.container.extensions.has(alias);
};

/**
 * Removes extension
 * @param {Array|string} alias
 * @returns {Fiber}
 */
Fiber.forgetExtension = function(alias) {
  _.each(_.castArray(alias), function(one) {
    Fiber.container.extensions.forget(one);
  });
  return this;
};

/**
 * Applies extension by `alias` to the given `object`.
 * Also you can provide `override` boolean to force override properties.
 * @param {Array|string} alias
 * @param {Object} object
 * @param {?boolean} [override=false]
 * @returns {Fiber}
 */
Fiber.applyExtension = function(alias, object, override) {
  Fiber.fn.class.include(object, Fiber.getExtension(alias), override);
  return this;
};

/**
 * Returns all extensions
 * @returns {Object}
 */
Fiber.getExtensions = function() {
  return Fiber.container.extensions.all();
};

/**
 * Returns list of available extensions
 * @param {?Array} [exclude=[]]
 * @returns {string[]}
 */
Fiber.getExtensionsList = function(exclude) {
  return _.difference(Fiber.container.extensions.keys(), val(exclude, [], _.isArray));
};
