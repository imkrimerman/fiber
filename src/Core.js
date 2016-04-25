/**
 * Returns extension if one is found or empty object otherwise
 * @param {Array|string} alias
 * @param {?string|boolean} [method='getCode']
 * @returns {Array|string}
 */
Fiber.getExtension = function(alias, method) {
  return Fiber.fn.extensions.get(alias, method);
};

/**
 * Adds extension
 * @param {Object|string} alias
 * @param {Object|Function} [extension]
 * @param {?boolean} [override=false]
 * @returns {Fiber}
 */
Fiber.addExtension = function(alias, extension, override) {
  Fiber.fn.extensions.set(alias, extension, override);
  return this;
};

/**
 * Sets extension, overrides if it was already set
 * @param {Object|string} alias
 * @param {Object|Function} extension
 * @returns {Fiber}
 */
Fiber.setExtension = function(alias, extension) {
  Fiber.fn.extensions.set(alias, extension, true);
  return this;
};

/**
 * Determine if Fiber has extension by given `alias`
 * @param {Array|string} alias
 * @param {?string} [method=every]
 * @returns {boolean}
 */
Fiber.hasExtension = function(alias, method) {
  return Fiber.fn.extensions.has(alias, method);
};

/**
 * Removes extension
 * @param {Array|string} alias
 * @returns {Fiber}
 */
Fiber.forgetExtension = function(alias) {
  Fiber.fn.extensions.forget(alias);
  return this;
};

/**
 * Returns code capsule(s) from given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.makeExtensionCall = function(alias, method, args) {
  return Fiber.fn.extensions.makeCall(alias, method, args);
};

/**
 * Returns list of extensions
 * @param {?boolean} [asObject=false]
 * @param {?Array|string} [exclude=[]]
 * @returns {Object|Array}
 */
Fiber.getExtensionList = function(asObject, exclude) {
  return Fiber.fn.extensions.list(asObject, exclude);
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
  Fiber.fn.extensions.apply(alias, object, options);
  return this;
};

/**
 * Returns name(s) of the given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {string|Array}
 */
Fiber.getExtensionName = function(alias) {
  return Fiber.fn.extensions.getName(alias);
};

/**
 * Returns code capsule(s) from the given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.getExtensionCodeCapsule = function(alias) {
  return Fiber.fn.extensions.getCodeCapsule(alias);
};

/**
 * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.getExtensionInitMethod = function(alias) {
  return Fiber.fn.extensions.getInitMethod(alias);
};

/**
 * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
 * as a hash map where keys are aliases and values are initialize method(s)
 * @param {string|Array} alias
 * @returns {Object|Array.<Object>}
 */
Fiber.getExtensionInitMethodMap = function(alias) {
  return Fiber.fn.extensions.getInitMethodMap(alias);
};
