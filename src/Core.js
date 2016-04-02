/**
 * Returns extension if one is found or empty object otherwise
 * @param {Array|string} alias
 * @returns {Array|string}
 */
Fiber.getExtension = function(alias) {
  if (_.isArray(alias)) return _.map(_.castArray(alias), function(one) {
      return Fiber.getExtension(one);
    }
  );
  var retrieved = Fiber.container.extensions.get(alias, {});
  if (retrieved instanceof Fiber.Extension) retrieved = retrieved.code;
  return _.isString(alias) ? retrieved : alias;
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
    }
  );
  else {
    if (Fiber.hasExtension(alias) && ! val(override, false)) return this;
    if (extension instanceof Fiber.Extension) extension = extension.code;
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
  if (_.isArray(alias)) return _[method](
    alias, function(one) {
      return Fiber.hasExtension(one);
    }
  );
  return Fiber.container.extensions.has(alias);
};

/**
 * Removes extension
 * @param {Array|string} alias
 * @returns {Fiber}
 */
Fiber.forgetExtension = function(alias) {
  _.each(
    _.castArray(alias), function(one) {
      Fiber.container.extensions.forget(one);
    }
  );
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
  var extension = Fiber.getExtension(alias);
  Fiber.fn.class.include(object, extension, override);
  Fiber.fn.class.setObjectExtensions(object, alias);
  return this;
};

/**
 * Initializes all object extensions
 * @param {Object} object
 * @returns {boolean}
 */
Fiber.initializeExtensions = function(object, list) {
  list = val(list, Fiber.fn.class.getObjectExtensions(object), _.isArray);
  if (! list || _.isEmpty(list)) return false;
  var initMethods = Fiber.fn.class.getExtensionsInitMethods(list);
  for (var i = 0; i < initMethods.length; i ++) {
    var method = Fiber.fn.class.resolveMethod(object, initMethods[i]);
    if (method) method(options);
  }
};

/**
 * Returns all extensions
 * @returns {Object}
 */
Fiber.getAllExtensions = function() {
  return Fiber.container.extensions.all();
};

/**
 * Returns list of extensions
 * @param {?boolean} [asObj=false]
 * @param {?Array} [exclude=[]]
 * @returns {*}
 */
Fiber.getExtensionsList = function(asObj, exclude) {
  asObj = val(asObj, false, _.isBoolean);
  exclude = val(exclude, [], _.isArray);
  var list = Fiber.container.extensions.all();
  if (! _.isEmpty(exclude)) list = _.omit(list, exclude);
  return asObj ? list : _.values(list);
};

/**
 * Fiber logs
 * @type {Object}
 */
Fiber.logs = {
  debug: new Fiber.Log({level: Fiber.Log.levels.debug}),
  system: new Fiber.Log({level: Fiber.Log.levels.error})
};
