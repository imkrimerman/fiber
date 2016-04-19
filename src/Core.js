/**
 * Returns extension if one is found or empty object otherwise
 * @param {Array|string} alias
 * @param {?string|boolean} [method='getCode']
 * @returns {Array|string}
 */
Fiber.getExtension = function(alias, method) {
  if (! Fiber.has('container')) return alias;
  method = val(method, 'getCode');

  if (_.isArray(alias)) return _.map(_.castArray(alias), function(one) {
    return Fiber.getExtension(one, method);
  });

  if (! _.isString(alias)) return alias;
  var retrieved = Fiber.container.extensions.get(alias, null);
  if (! retrieved) return null;
  return _.isString(alias) ? Fiber.fn.extensionMapCall(retrieved, method, true) : alias;
};

/**
 * Adds extension
 * @param {Object|string} alias
 * @param {Object|Function} [extension]
 * @param {?boolean} [override=false]
 * @returns {Fiber}
 */
Fiber.addExtension = function(alias, extension, override) {
  if (! Fiber.has('container')) return this;
  if (_.isPlainObject(alias)) _.each(alias, function(one, oneAlias) {
      // Allow passing multiple extensions `{'name': extension}`,
      // `override` will go next instead of `extension` argument
      Fiber.addExtension(oneAlias, one, extension);
    }
  );
  else {
    if (Fiber.hasExtension(alias) && ! val(override, false)) return this;
    if (! (extension instanceof Fiber.Extension)) extension = new Fiber.Extension(extension);
    extension.name = alias;
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
  if (! Fiber.has('container')) return false;
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
  if (! Fiber.has('container')) return this;
  _(alias).castArray().each(function(one) {
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
 * @param {?Object} [options={}]
 * @returns {Fiber}
 */
Fiber.applyExtension = function(alias, object, override, options) {
  var extension = Fiber.getExtensionCode(alias);
  Fiber.fn.class.include(object, extension, override);
  Fiber.fn.class.setExtensions(object, alias);
  if (! Fiber.has('container')) this.applyExtensions();
  else Fiber.initializeExtensions(object, options, extension);
  return this;
};

/**
 * Returns extension code
 * @param {Array|string} alias
 * @returns {Array|Object}
 */
Fiber.getExtensionCode = function(alias) {
  var extension = Fiber.getExtension(alias, false)
    , extensionCode = Fiber.fn.extensionMapCall(extension, 'getCode');
  return _.isArray(extension) ? extensionCode : extensionCode[0];
};

/**
 * Returns extension initialize method
 * @param {Array|string} alias
 * @returns {Array|Object}
 */
Fiber.getExtensionInitMethod = function(alias) {
  var extension = Fiber.getExtension(alias, false)
    , extensionInit = Fiber.fn.extensionMapCall(extension, 'getInitMethod');
  return _.isArray(extension) ? extensionInit : extensionInit[0];
};

/**
 * Returns extension initialize method map
 * @param {Array|string} alias
 * @returns {Object}
 */
Fiber.getExtensionInitMethodMap = function(alias) {
  var extension = Fiber.getExtension(alias, false)
    , extensionInit = Fiber.fn.extensionMapCall(extension, 'getInitMethod');
  return _.zipObject(alias, extensionInit);
};

/**
 * Returns list of names. Calls `getName` on each Extension class
 * @returns {Array}
 */
Fiber.getExtensionsNames = function() {
  return Fiber.fn.extensionMapCall(Fiber.container.all('extensions'), 'getName');
},

/**
 * Initializes all object extensions
 * If `options.extensionsList` is provided then resolved or list
 * Will try to get and use `options.extensionsList` for initialize if found
 * @param {Object} object
 * @param {?Object} [options]
 * @param {?Array} [list]
 * @returns {boolean}
 */
  Fiber.initializeExtensions = function(object, options, list) {
    var optionsList = val(options, {})[Fiber.Constants.extensions.optionsProperty]
      , hasListInOptions = _.isArray(optionsList) || _.isString(optionsList);

    if (list) {
      list = _.castArray(list);
      if (hasListInOptions) list = list.concat(_.castArray(optionsList));
    }
    else {
      if (hasListInOptions) list = _.castArray(optionsList);
      else list = Fiber.fn.class.getExtensions(object);
    }

    if (! list) return false;

    var initMethodsMap = Fiber.getExtensionInitMethodMap(list)

    for (var name in initMethodsMap) {
      if (initMethodsMap[name] == null) continue;
      var method = Fiber.fn.class.resolveMethod(object, initMethodsMap[name]);
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
 * @param {?Array|string} [exclude=[]]
 * @returns {*}
 */
Fiber.getExtensionsList = function(asObj, exclude) {
  asObj = val(asObj, false, _.isBoolean);
  exclude = _.castArray(val(exclude, []));
  var list = Fiber.container.extensions.all();
  if (! _.isEmpty(exclude)) list = _.omit(list, exclude);
  return asObj ? list : _.values(list);
};

/**
 * Fiber logs
 * @type {Object}
 */
Fiber.logs = {
  debug: new Fiber.Log({level: Fiber.Constants.log.levels.debug}),
  system: new Fiber.Log({level: Fiber.Constants.log.levels.error})
};
