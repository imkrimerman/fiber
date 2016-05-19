/**
 * Current user agent
 * @type {string}
 */
Fiber.Browser = $fn.whatBrowser();

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
  if (arguments.length > 1 && ! $isArr(abstract))
    return Fiber.container.make(abstract, parameters, scope);

  var made = _.map($castArr(abstract), function(one) {
    var abstractAlias = null
      , parameters = []
      , scope = null;

    if ($isArr(one) && one.length > 1) {
      abstractAlias = one[0];
      parameters = one[1];
      scope = one[2];
    }
    else if ($isObj(one)) return one;
    else if ($isStr(one)) abstractAlias = one;

    return Fiber.container.make(abstractAlias, parameters, scope);
  });
  return $isArr(abstract) ? made : _.first(made);
};

/**
 * Retrieves type from the extensions and shared container
 * @param {Array|string} abstract
 * @returns {Array.<Object>|Object}
 */
Fiber.retrieve = function(abstract) {
  var result = _.map($castArr(abstract), function(one) {
    return Fiber.retrieve(one);
  });
  return ! $isArr(abstract) ? result : _.first(result);
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
