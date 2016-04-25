Fiber.fn.extensions = {

  /**
   * Build in Extensions Registry
   * @type {Object}
   * @private
   */
  __registry: {},

  /**
   * Reference to the extensions bag in ioc container
   * @type {Object.<Fiber.Bag>}
   * @private
   */
  __access: function() {
    return Fiber.container.extensions;
  },

  /**
   * Returns extension if one is found or empty object otherwise.
   * @param {Array|string} alias
   * @param {?boolean} [retrieveCode=true]
   * @returns {null|Object.<Fiber.Extension>|Array.<Fiber.Extension>|Object|Function|string}
   */
  get: function(alias, retrieveCode) {
    if (! Fiber.has('container')) return alias;

    if (_.isArray(alias)) return _.map(_.castArray(alias), function(one) {
      return Fiber.fn.extensions.get(one, retrieveCode);
    });

    var method = val(retrieveCode, true, _.isBoolean) ? 'getCodeCapsule' : null;

    if (! _.isString(alias)) return alias;
    if (! Fiber.has('container')) return null;

    var retrieved = this.__access().get(alias, null);

    if (! retrieved) return null;
    return _.isString(alias) ? Fiber.fn.extensions.mapCall(retrieved, method, true) : alias;
  },

  /**
   * Adds extension
   * @param {Object|string} alias
   * @param {Object|Function} [extension]
   * @param {?boolean} [override=false]
   * @returns {Fiber}
   */
  set: function(alias, extension, override) {
    if (! Fiber.has('container')) return this;
    if (_.isPlainObject(alias)) _.each(alias, function(oneExt, oneExtAlias) {
      // Allow passing multiple extensions `{'name': extension}`,
      // `override` will go next instead of `extension` argument
      Fiber.fn.extensions.set(oneExtAlias, oneExt, extension);
    });
    else {
      if (Fiber.fn.extensions.has(alias) && ! val(override, false)) return this;
      if (Fiber.fn.extensions.isNot(extension)) extension = new Fiber.Extension(extension);
      extension.name = alias;
      this.__access().set(alias, extension);
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
    if (! Fiber.has('container')) return false;
    method = val(method, 'every', _.isString);
    if (_.isArray(alias)) return _[method](alias, function(one) {
      return Fiber.fn.extensions.has(one);
    });
    return this.__access().has(alias);
  },

  /**
   * Removes extension
   * @param {Array|string} alias
   * @returns {Fiber}
   */
  forget: function(alias) {
    if (! Fiber.has('container')) return this;
    _(alias).castArray().each(function(one) {
      this.__access().forget(one);
    }.bind(this));
    return this;
  },

  /**
   * Returns all extensions
   * @returns {Object}
   */
  all: function() {
    if (! Fiber.has('container')) return {};
    return this.__access().all();
  },

  /**
   * Returns hash map of extensions without list of excluded
   * @param {?Array|string} [exclude=[]]
   * @returns {Object}
   */
  omit: function(exclude) {
    var extensions = Fiber.fn.extensions.all();
    exclude = _.castArray(val(exclude, []));
    return _.isEmpty(exclude) ? extensions : _.omit(extensions, exclude);
  },

  /**
   * Returns list of extensions
   * @param {?boolean} [asObj=false]
   * @param {?Array|string} [exclude=[]]
   * @returns {Object|Array}
   */
  list: function(asObj, exclude) {
    var extensions = Fiber.fn.extensions.omit(exclude);
    return val(asObj, false, _.isBoolean) ? extensions : _.values(extensions);
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
    return Fiber.fn.apply(extension, method, args, scope);
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
    var extension = Fiber.fn.extensions.get(alias);
    if (! extension) return this;
    Fiber.fn.class.include(object, extension, options.override);
    Fiber.fn.extensions.setIncluded(object, alias);
    Fiber.fn.extensions.init(object, options);
    return this;
  },

  /**
   * Initializes all object extensions
   * You can also pass options to init method of each extension by specifying
   * extension name as key and arguments as value.
   * @param {Object} object
   * @param {?Object} [options]
   * @returns {boolean}
   */
  init: function(object, options) {
    var defaultOpts = {override: false, list: [], args: {}};
    options = valMerge(options, defaultOpts, 'defaults');

    if (_.isEmpty(options.list)) options.list = Fiber.fn.extensions.getIncluded(object) || [];
    var initMethodsMap = _.zipObject(options.list, Fiber.fn.extensions.mapCall(options.list, 'getInitMethod'));

    for (var name in initMethodsMap) {
      if (! initMethodsMap[name]) continue;
      var method = Fiber.fn.class.resolveMethod(object, initMethodsMap[name]);
      if (_.isFunction(method)) method(options.args[name]);
    }
  },

  /**
   * Detects extensions at the given object.
   * Returns list of extension names, if 2nd argument is provided then it'll return extensions them selves
   * @param {Object} object
   * @param {?boolean} [returnExtensions=false]
   * @returns {Array}
   */
  detect: function(object, returnExtensions) {
    if (! _.isObject(object)) return [];
    var detected = [];
    returnExtensions = val(returnExtensions, false, _.isBoolean);
    _.each(Fiber.fn.extensions.all(), function(extension, key) {
      var extensionProps = _.keys(extension.getCodeCapsule());
      if (Fiber.fn.expectHasAllProps(object, extensionProps)) {
        if (! returnExtensions) return detected.push(key);
        detected.push(Fiber.fn.extensions.get(key));
      }
    });
    return detected;
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
    var extension = Fiber.getExtension(alias, false)
      , result = Fiber.fn.extensions.mapCall(extension, method, false, args, scope);
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
    var casted = _.castArray(extension)
      , boundCall = _.unary(_.partialRight(Fiber.fn.extensions.call, method, args, scope));

    first = val(first, false);
    if (method) casted = casted.map(boundCall);
    return first ? _.first(casted) : casted;
  },

  /**
   * Returns name(s) of the given extension(s) resolved from ioc using alias(es)
   * @param {string|Array} alias
   * @returns {string|Array}
   */
  getName: function(alias) {
    return Fiber.fn.extensions.makeCall(alias, 'getName');
  },

  /**
   * Returns code capsule(s) from the given extension(s) resolved from ioc using alias(es)
   * @param {string|Array} alias
   * @returns {Object|Array.<Object>}
   */
  getCodeCapsule: function(alias) {
    return Fiber.fn.extensions.makeCall(alias, 'getCodeCapsule');
  },

  /**
   * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
   * @param {string|Array} alias
   * @returns {Object|Array.<Object>}
   */
  getInitMethod: function(alias) {
    return Fiber.fn.extensions.makeCall(alias, 'getInitMethod');
  },

  /**
   * Returns initialize method(s) for the given extension(s) resolved from ioc using alias(es)
   * as a hash map where keys are aliases and values are initialize method(s)
   * @param {string|Array} alias
   * @returns {Object|Array.<Object>}
   */
  getInitMethodMap: function(aliases) {
    return _.zipObject(aliases, Fiber.fn.extensions.getInitMethod(aliases));
  },

  /**
   * Returns list of included extensions into the object
   * @param {Object} object
   * @returns {Array|void}
   */
  getIncluded: function(object) {
    return object[Fiber.Constants.extensions.private];
  },

  /**
   * Sets list of extensions as included into the object
   * @param {Object} object
   * @param {Array} list
   * @param {?boolean} [reset=false]
   * @returns {*}
   */
  setIncluded: function(object, list, reset) {
    var hoistingKey = Fiber.Constants.extensions.hoisting
      , extensionKey = Fiber.Constants.extensions.private;
    if (Fiber.fn.class.is(object)) object[hoistingKey] = Fiber.fn.concat(extensionKey, object[hoistingKey] || []);
    if (reset || ! _.has(object, extensionKey) || ! _.isArray(object[extensionKey])) object[extensionKey] = [];
    return object[extensionKey] = Fiber.fn.concat(object[extensionKey], list);
  },

  /**
   * Determines if list of extensions included to the object
   * @param {Object} object
   * @param {Array} list
   * @param {?string} [match='every']
   * @returns {boolean}
   */
  hasIncluded: function(object, list, match) {
    var key = Fiber.Constants.extensions.private
      , fn = val(match, 'every', Fiber.fn.createIncludes(['every', 'some']));
    if (! _.has(object, key) || ! _.isArray(object[key])) return false;
    return _[fn](function(one) { return ~list.indexOf(one); });
  },

  /**
   * Finds extension names at the provided object
   * @param {Object} object
   * @returns {Array}
   */
  findIncluded: function(object) {
    if (arguments.length > 1) {
      var args = _.compact(_.toArray(arguments)), result = [];
      for (var i = 0; i < args.length; i ++)
        result = result.concat(Fiber.fn.extensions.findIncluded(args[i]));
      return Fiber.fn.concat.apply(null, result);
    }

    if (! _.isObject(object)) return [];
    var found = [];
    _.each(_.castArray(object), function(obj) {
      if (_.isString(obj)) found.push(obj);
      else if (Fiber.fn.extensions.is(obj)) found.push(obj.getName());
    });
    return found;
  },

  /**
   * Adds extensions to registry
   * @param {Object.<Fiber.Extension>} extension
   */
  register: function(extension) {
    this.__registry[extension.getName()] = extension;
    return this;
  },

  /**
   * Removes extension from registry
   * @param {string|Object.<Fiber.Extension>} alias
   * @returns {boolean}
   */
  unregister: function(alias) {
    if (Fiber.fn.extensions.is(Fiber.Extension)) alias = alias.getName();
    if (! _.isString(alias)) return false;
    _.unset(this.__registry, alias);
    return true;
  },

  /**
   * Converts registry of extensions to hash map
   * with names as keys and extension as values
   * @returns {Object}
   */
  getRegistry: function() {
    return this.__registry;
  },

  /**
   * Sets registry
   * @param {Object} registry
   * @returns {Fiber.fn.extensions}
   */
  setRegistry: function(registry) {
    this.__registry = val(registry, this.__registry, _.isPlainObject);
    return this;
  },

  /**
   * Clones registry and returns it
   * @returns {Object}
   */
  cloneRegistry: function() {
    return _.clone(this.getRegistry());
  },

  /**
   * Creates new Fiber extension
   * @param {string} name
   * @param {Object|Function} code
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
  is: function(extension) {
    return extension instanceof Fiber.Extension;
  },

  /**
   * Determines if given extension is Fiber.Extension Class
   * @param {*} extension
   * @returns {boolean}
   */
  isClass: function(extension) {
    return Fiber.fn.class.is(extension) && Fiber.fn.extensions.is(extension.prototype);
  },

  /**
   * Determines if given extension is NOT instance of Fiber.Extension Class
   * @param {*} extension
   * @returns {boolean}
   */
  isNot: function(extension) {
    return ! Fiber.fn.extensions.is(extension);
  },

  /**
   * Determines if given extension is NOT Fiber.Extension Class
   * @param {*} extension
   * @returns {boolean}
   */
  isNotClass: function(extension) {
    return ! Fiber.fn.extensions.is(extension);
  }
};
