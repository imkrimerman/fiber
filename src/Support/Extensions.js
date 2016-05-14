/**
 * Extensions Support
 * @type {Object}
 */
Fiber.fn.extensions = {

  /**
   * Private property name
   * @type {string}
   */
  key: '_extensions',

  /**
   * Migration property name
   * @type {string}
   */
  migrate: '_needsPropMigration',

  /**
   * Returns extension if one is found or empty object otherwise.
   * @param {Array|string} alias
   * @param {?boolean} [retrieveCode=true]
   * @returns {null|Object.<Fiber.Extension>|Array.<Fiber.Extension>|Object|function()|string}
   */
  get: function(alias, retrieveCode) {
    if (_.isArray(alias)) return _.map($fn.castArr(alias), function(one) {
      return $fn.extensions.get(one, retrieveCode);
    });

    var method = $val(retrieveCode, true, _.isBoolean) ? 'getCode' : null;
    if (! _.isString(alias)) return alias;
    var retrieved = this._access('get', alias, null);
    if (! retrieved) return null;
    return _.isString(alias) ? $fn.extensions.mapCall(retrieved, method, true) : alias;
  },

  /**
   * Adds extension
   * @param {Object|string} alias
   * @param {Object|function()} [extension]
   * @param {?boolean} [override=false]
   * @returns {Fiber}
   */
  set: function(alias, extension, override) {
    if (_.isPlainObject(alias)) _.each(alias, function(oneExt, oneExtAlias) {
      // Allow passing multiple extensions `{'name': extension}`,
      // `override` will go next instead of `extension` argument
      $fn.extensions.set(oneExtAlias, oneExt, extension);
    });
    else {
      if ($fn.extensions.has(alias) && ! $val(override, false)) return this;
      if (! $fn.extensions.isExtension(extension)) extension = new Fiber.Extension(extension);
      extension.setName(alias);
      this._access('set', alias, extension);
    }
    return this;
  },

  /**
   * Determine if Fiber has extension by given `alias`
   * @param {Array|string} alias
   * @param {?string} [method=every]
   * @returns {boolean}
   */
  has: function(alias, method) {
    method = $val(method, 'every', _.isString);
    if (_.isArray(alias)) return _[method](alias, function(one) {
      return $fn.extensions.has(one);
    });
    return this._access('has', alias);
  },

  /**
   * Removes extension
   * @param {Array|string} alias
   * @returns {Fiber}
   */
  forget: function(alias) {
    _(alias).castArray().each(function(one) {
      this._access('forget', one);
    }.bind(this));
    return this;
  },

  /**
   * Returns all extensions
   * @returns {Object}
   */
  all: function() {
    return this._access('all');
  },

  /**
   * Returns hash map of extensions without list of excluded
   * @param {?Array|string} [exclude=[]]
   * @returns {Object}
   */
  omit: function(exclude) {
    var extensions = $fn.extensions.all();
    exclude = $fn.castArr($val(exclude, []));
    return _.isEmpty(exclude) ? extensions : _.omit(extensions, exclude);
  },

  /**
   * Returns list of extensions
   * @param {?boolean} [asObj=false]
   * @param {?Array|string} [exclude=[]]
   * @returns {Object|Array}
   */
  list: function(asObj, exclude) {
    var extensions = $fn.extensions.omit(exclude);
    return $val(asObj, false, _.isBoolean) ? extensions : _.values(extensions);
  },

  /**
   * Returns list of extensions names
   * @return {*|Array}
   */
  listNames: function() {
    return $fn.extensions.mapCall(_.values($fn.extensions.all()), 'getName');
  },

  /**
   * Calls extension method with arguments and bound scope
   * @param {Object.<Fiber.Extension>} extension
   * @param {?string} [method]
   * @param {?Array|Arguments} [args]
   * @param {?Object} [scope]
   * @returns {*}
   */
  call: function(extension, method, args, scope) {
    return $fn.apply(extension, method, args, scope);
  },

  /**
   * Applies extension by `alias` to the given `object`.
   * Also you can provide `override` boolean in options to force override the properties.
   * @param {Array|string} alias
   * @param {Object} object
   * @param {?Object} [options={}]
   * @returns {Fiber}
   */
  apply: function(alias, object, options) {
    options = $valMerge(options, { override: false, init: true, list: [], args: {} });
    var extension = $fn.extensions.get(alias);
    if (! extension) return this;
    $fn.class.include(object, extension, options.override);
    $fn.extensions.setIncluded(object, alias);
    options.init && $fn.extensions.init(object, options.list, options.args);
    return this;
  },

  /**
   * Initializes all object extensions
   * You can also pass options to init method of each extension by specifying
   * extension name as key and arguments as value.
   * @param {Object} object
   * @param {?Array|string} [list]
   * @param {?Array|Object} [args]
   * @return {Fiber.fn.extensions}
   */
  init: function(object, list, args) {
    args = $val(args, {}, [_.isArray, _.isPlainObject]);
    var extensions = _.values($fn.extensions.all());
    if (_.isArray(list) || _.isString(list)) extensions = $fn.extensions.get(list, false);
    for (var i = 0; i < extensions.length; i ++) {
      var extension = extensions[i]
        , initMethod = extension.getInitMethod()
        , resolve = $fn.class.resolveMethod(object, initMethod);
      if (_.isFunction(resolve)) resolve.apply(object, _.isArray(args) ? args : args[extension.getName()]);
    }
    return this;
  },

  /**
   * Resolves extension(s) from ioc container by `alias` and calls method on it(them) with the given `args`
   * @param {string|Array} alias
   * @param {string} method
   * @param {?Array} [args]
   * @param {?Object} [scope]
   * @returns {*|Array}
   */
  makeCall: function(alias, method, args, scope) {
    var extension = $fn.extensions.get(alias, method)
      , result = $fn.extensions.mapCall(extension, method, false, args, scope);
    return _.isArray(extension) ? result : _.first(result);
  },

  /**
   * Traverses through given extensions and calls method on it
   * @param {Object.<Fiber.Extension>|Array} extension
   * @param {string} method
   * @param {?boolean} [first=false]
   * @param {?Array} [args]
   * @param {?Object} [scope]
   * @returns {Array}
   */
  mapCall: function(extension, method, first, args, scope) {
    if (_.isPlainObject(extension)) extension = _.values(extension);
    var boundCall = function(ext) {return $fn.extensions.call(ext, method, args, scope);}
      , casted = $fn.castArr(extension);
    first = $val(first, false);
    if (method) casted = casted.map(boundCall);
    return first ? _.first(casted) : casted;
  },

  /**
   * Ensures that extension code capsule is returned
   * @param {Object.<Fiber.Extension>|Array|*} extension
   * @returns {Object|Array}
   */
  ensureCode: function(extension) {
    return $fn.multi(extension, function(one) {
      if (! Fiber.Extension || ! (one instanceof Fiber.Extension)) return one;
      return one.getCode();
    });
  },

  /**
   * Returns name(s) of the given extension(s) resolved from ioc using alias(es)
   * @param {string|Array} alias
   * @returns {string|Array}
   */
  getName: function(alias) {
    return $fn.extensions.makeCall(alias, 'getName');
  },

  /**
   * Returns code capsule(s) from the given extension(s) resolved from ioc using alias(es)
   * @param {string|Array} alias
   * @returns {Object|Array.<Object>}
   */
  getCode: function(alias) {
    return $fn.extensions.makeCall(alias, 'getCode');
  },

  /**
   * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
   * @param {string|Array} alias
   * @returns {Object|Array.<Object>}
   */
  getInitMethod: function(alias) {
    return $fn.extensions.makeCall(alias, 'getInitMethod');
  },

  /**
   * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
   * as a hash map where keys are aliases and values are initialize method(s)
   * @param {string|Array} alias
   * @returns {Object|Array.<Object>}
   */
  getInitMethodMap: function(aliases) {
    return _.zipObject(aliases, $fn.extensions.getInitMethod(aliases));
  },

  /**
   * Returns list of included extensions into the object
   * @param {Object} object
   * @returns {Array|void}
   */
  getIncluded: function(object) {
    return object[$fn.extensions.key];
  },

  /**
   * Sets list of extensions as included into the object
   * @param {Object} object
   * @param {Array} list
   * @param {?boolean} [reset=false]
   * @returns {*}
   */
  setIncluded: function(object, list, reset) {
    var hoistingKey = $fn.extensions.migrate
      , extensionKey = $fn.extensions.key;
    if ($fn.class.isClass(object)) object[hoistingKey] = $fn.concat(extensionKey, object[hoistingKey] || []);
    if (reset || ! $fn.has(object, extensionKey) || ! _.isArray(object[extensionKey])) object[extensionKey] = [];
    return object[extensionKey] = $fn.concat(object[extensionKey], list);
  },

  /**
   * Determines if list of extensions included to the object
   * @param {Object} object
   * @param {Array} list
   * @param {?string} [match='every']
   * @returns {boolean}
   */
  hasIncluded: function(object, list, match) {
    var key = $fn.extensions.key
      , method = $valIncludes(match, 'every');
    if (! $fn.has(object, key) || ! _.isArray(object[key])) return false;
    return _[method](function(one) { return ~ list.indexOf(one); });
  },

  /**
   * Finds extension names at the provided object
   * @param {Object} object
   * @returns {Array}
   */
  findIncluded: function(object) {
    if (arguments.length > 1) {
      var args = $fn.compact(_.toArray(arguments)), result = [];
      for (var i = 0; i < args.length; i ++)
        result = result.concat($fn.extensions.findIncluded(args[i]));
      return $fn.concat.apply(null, result);
    }

    if (! _.isObject(object)) return [];
    var found = [];
    _.each($fn.castArr(object), function(obj) {
      if (_.isString(obj)) found.push(obj);
      else if ($fn.extensions.isExtension(obj)) found.push(obj.getName());
    });
    return found;
  },

  /**
   * Creates new Fiber extension
   * @param {string} name
   * @param {Object|function()} code
   * @returns {Object.<Fiber.Extension>}
   */
  create: function(name, code) {
    return new Fiber.Extension(name, code);
  },

  /**
   * Determines if given extension is instance of Fiber.Extension Class
   * @param {*} extension
   * @returns {boolean}
   */
  isExtension: function(extension) {
    if (! $fn.class.isClass(Fiber.Extension)) return false;
    return $fn.class.isInstance(extension) && extension instanceof Fiber.Extension;
  },

  /**
   * Determines if given extension is Fiber.Extension Class
   * @param {*} extension
   * @returns {boolean}
   */
  isExtensionClass: function(extension) {
    return $fn.class.isClass(extension) && $fn.extensions.isExtension(extension.prototype);
  },

  /**
   * Reference to the extensions bag in ioc container
   * @param {?string} [method]
   * @param {...args}
   * @return {*}
   * @private
   */
  _access: function(method) {
    if (! Fiber.hasOwnProperty('container')) return [];
    var bag = Fiber.container.extensions;
    if (! arguments.length) return bag;
    if (! _.isFunction(bag[method])) return bag[method];
    return bag[method].apply(bag, _.drop(arguments));
  }
};
