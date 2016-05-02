/**
 * Returns extension if one is found or empty object otherwise
 * @param {Array|string} alias
 * @param {?string|boolean} [method='getCode']
 * @returns {Array|string}
 */
Fiber.getExtension = function(alias, method) {
  return $fn.extensions.get(alias, method);
};

/**
 * Adds extension
 * @param {Object|string} alias
 * @param {Object|Function} [extension]
 * @param {?boolean} [override=false]
 * @returns {Fiber}
 */
Fiber.addExtension = function(alias, extension, override) {
  $fn.extensions.set(alias, extension, override);
  return this;
};

/**
 * Sets extension, overrides if it was already set
 * @param {Object|string} alias
 * @param {Object|Function} extension
 * @returns {Fiber}
 */
Fiber.setExtension = function(alias, extension) {
  $fn.extensions.set(alias, extension, true);
  return this;
};

/**
 * Determine if Fiber has extension by given `alias`
 * @param {Array|string} alias
 * @param {?string} [method=every]
 * @returns {boolean}
 */
Fiber.hasExtension = function(alias, method) {
  return $fn.extensions.has(alias, method);
};

/**
 * Removes extension
 * @param {Array|string} alias
 * @returns {Fiber}
 */
Fiber.forgetExtension = function(alias) {
  $fn.extensions.forget(alias);
  return this;
};

/**
 * Returns list of extensions
 * @param {?boolean} [asObject=false]
 * @param {?Array|string} [exclude=[]]
 * @returns {Object|Array}
 */
Fiber.getExtensionList = function(asObject, exclude) {
  return $fn.extensions.list(asObject, exclude);
};

/**
 * Returns code capsule(s) from given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.makeExtensionCall = function(alias, method, args) {
  return $fn.extensions.makeCall(alias, method, args);
};

/**
 * Applies extension by `alias` to the given `object`.
 * Also you can provide `override` boolean to force override of properties.
 * @param {Array|string} alias
 * @param {Object} object
 * @param {?Object} [options={}]
 * @returns {Fiber}
 */
Fiber.applyExtension = function(alias, object, options) {
  $fn.extensions.apply(alias, object, options);
  return this;
};

/**
 * Returns name(s) of the given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {string|Array}
 */
Fiber.getExtensionName = function(alias) {
  return $fn.extensions.getName(alias);
};

/**
 * Returns code capsule(s) from the given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.getExtensionCodeCapsule = function(alias) {
  return $fn.extensions.getCodeCapsule(alias);
};

/**
 * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.getExtensionInitMethod = function(alias) {
  return $fn.extensions.getInitMethod(alias);
};

/**
 * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
 * as a hash map where keys are aliases and values are initialize method(s)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.getExtensionInitMethodMap = function(alias) {
  return $fn.extensions.getInitMethodMap(alias);
};

/**
 * Resolve the given type from the container.
 * @param {string|Array} abstract
 * @param {?Array} [parameters]
 * @param {?Object} [scope]
 * @returns {*}
 * @throws Resolution Exception
 *
 * @example
 * Fiber.make([ ['Bag', {one: 1, two: 2}], ['Log', {level: 'debug}] ]);
 * Fiber.make([$OwnProps, $Extend, 'Binder', 'Events']);
 * Fiber.make('Bag', {one: 1, two: 2});
 */
Fiber.make = function(abstract, parameters, scope) {
  if (! Fiber.hasOwnProperty('container')) return abstract;
  if (arguments.length > 1 && ! _.isArray(abstract))
    return Fiber.container.make(abstract, parameters, scope);

  var made = _.map($fn.castArr(abstract), function(one) {
    var abstractAlias = null
      , parameters = []
      , scope = null;

    if (_.isArray(one) && one.length > 1) {
      abstractAlias = one[0];
      parameters = one[1];
      scope = one[2];
    }
    else if (_.isObject(one)) return one;
    else if (_.isString(one)) abstractAlias = one;

    return Fiber.container.make(abstractAlias, parameters, scope);
  });
  return _.isArray(abstract) ? made : _.first(made);
};

/**
 * Retrieves type from the extensions and shared container
 * @param {Array|string} abstract
 * @returns {Array.<Object>|Object}
 */
Fiber.retrieve = function(abstract) {
  var result = _.map($fn.castArr(abstract), function(one) {
    return Fiber.retrieve(one);
  });

  return ! _.isArray(abstract) ? result : _.first(result);
};

/**
 * Resolves dependencies from container
 * @param {Array|string} dependencies
 * @param {?boolean} [extensionToCode=true]
 * @returns {Array|*}
 */
Fiber.resolve = function(dependencies, extensionToCode) {
  if (! Fiber.hasOwnProperty('container')) return dependencies;
  return _.map(Fiber.container.resolve(dependencies), function(dependency) {
    return $fn.extensions.isExtension(dependency) && extensionToCode ? dependency.toCode() : dependency;
  });
};
