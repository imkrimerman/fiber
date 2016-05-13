/**
 * Access descriptors Support
 * @type {Object}
 */
Fiber.fn.descriptor = {

  /**
   * Default descriptor level
   * @type {Object}
   */
  defaults: 'public',

  /**
   * Access levels
   * @type {Object}
   */
  levels: {
    private: 'private',
    protected: 'protected',
    public: 'public'
  },

  /**
   * Access descriptors
   * @type {Object}
   */
  descriptors: {
    private: {enumerable: false, configurable: false, writable: false},
    protected: {enumerable: false, configurable: true, writable: false},
    public: {enumerable: true, configurable: true, writable: true},
    property: {enumerable: false, configurable: true, writable: true},
  },

  /**
   * Locked objects registry
   * @type {Object}
   * @private
   */
  _locked: {},

  /**
   * Returns defined descriptor for object property
   * @param {Object} object
   * @param {string} property
   * @returns {Object}
   */
  get: function(object, property) {
    if (! $fn.descriptor.canDescribe(object)) return {};
    return object.getOwnPropertyDescriptor(object, property);
  },

  /**
   * Defines property using level descriptor
   * @param {Object} object
   * @param {string} property
   * @param {string} level
   * @returns {Object}
   */
  level: function(object, property, level) {
    if (! $fn.descriptor.canDescribe(object)) return object;
    var properties = {}
      , args = [object, property]
      , isObject = _.isPlainObject(property)
      , getLevel = $fn.descriptor.getLevelDescriptor;

    if (arguments.length === 3) args.push(getLevel(level));
    else if (arguments.length === 2 && isObject) {
      for (var propName in property) properties[propName] = getLevel(property[name]);
      args.push(properties);
    }
    return $fn.descriptor.define.apply(null, args);
  },

  /**
   * Defines property using custom descriptor
   * @param {Object} object
   * @param {string|Object} property
   * @param {Object} descriptor
   * @returns {Object}
   */
  define: function(object, property, descriptor) {
    if (! $fn.descriptor.canDescribe(object)) return object;
    var properties = null;
    if (arguments.length === 3) properties = $fn.createPlain(property, descriptor);
    else if (arguments.length === 2 && _.isPlainObject(property)) properties = property;
    else return object;
    return Object.defineProperties(object, properties);
  },

  /**
   * Defines property using descriptor retrieved by alias and extender mixin. Will merge descriptor and mixin and then
   * will define property.
   * @param {Object} object
   * @param {string} property
   * @param {string} alias
   * @param {Object} extender
   * @returns {Object}
   */
  defineMerge: function(object, property, alias, extender) {
    var levelDescriptor = $fn.descriptor.getDescriptor(alias);
    if (! levelDescriptor) return object;
    return $fn.descriptor.define(object, property, $fn.merge(levelDescriptor, $val(extender, {}, _.isPlainObject)));
  },

  /**
   * Defines property using registered macros
   * @param {Object} object
   * @param {string} property
   * @param {Object} macros
   * @returns {Object}
   */
  defineMacros: function(object, property, macros, macrosArgs) {
    if (! $fn.macros.has(macros)) return object;
    macrosArgs = $fn.castArr($val(macrosArgs, []));
    var macrosCreator = $fn.macros.get(macros)
      , descriptor = macrosCreator.apply(object, macrosArgs);
    if (_.isFunction(macrosCreator)) return $fn.descriptor.define(object, property, descriptor);
    $log.error(macros + ' is not found.');
    return object;
  },

  /**
   * Makes object immutable. Prevents new properties from being added to it, prevents existing properties from being
   * removed and prevents existing properties, or their enumerability, configurability, or writability,
   * from being changed. In essence the object is made effectively immutable.
   * @param {Object} object
   * @param {?boolean} [deep=true]
   * @returns {Object|
   */
  immutable: function(object, deep) {
    if (! _.isObject(object)) return object;
    $val(deep, true, _.isBoolean) && _.each($fn.properties(object), function(property) {
      if ($fn.descriptor.canDescribe(property)) $fn.descriptor.immutable(property);
    });
    return Object.freeze(object);
  },

  /**
   * Makes object explicit. Preventing new properties from being added and marking all existing properties as
   * non-configurable. Values of present properties can still be changed as long as they are writable.
   * @param {Object} object
   * @param {?boolean} [deep=true]
   * @returns {Object}
   */
  explicit: function(object, deep) {
    if (! _.isObject(object)) return object;
    $val(deep, true, _.isBoolean) && _.each($fn.properties(object), function(property) {
      if ($fn.descriptor.canDescribe(property)) $fn.descriptor.explicit(property);
    });
    return Object.seal(object);
  },

  /**
   * Makes object strict. Prevents new properties from ever being added to an object (i.e. prevents future
   * extensions to the object).
   * @param {Object} object
   * @returns {Object}
   */
  strict: function(object) {
    return Object.preventExtensions(object);
  },

  /**
   * Locks object and adds to the Fiber State container. Locked object can then be unlocked by the secret.
   * @param {string} secret
   * @param {Object} object
   * @param {?boolean} [override=false]
   * @returns {Object}
   */
  lock: function(secret, object, override) {
    if (! $fn.descriptor.canDescribe(object)) return object;
    override = $val(override, false);
    if ($fn.descriptor.isLocked(secret) && ! override)
      return $fn.descriptor._locked[secret];
    var locked = $fn.descriptor.immutable($fn.clone(object, true));
    $fn.descriptor._locked[secret] = { original: object, locked: locked };
    return locked;
  },

  /**
   * Unlocks object and removes it from Fiber State container.
   * @param {string} secret
   * @param {Object} object
   * @returns {Object}
   */
  unlock: function(secret, object) {
    if (! $fn.descriptor.canDescribe(object) || ! $fn.descriptor.isLocked(secret)) return object;
    var locked = $fn.descriptor._locked[secret]
      , original = locked.original;
    delete $fn.descriptor._locked[secret];
    return original;
  },

  /**
   * Determines if object is immutable.
   * @param {Object} object
   * @returns {boolean}
   */
  isImmutable: function(object) {
    return Object.isFrozen(object);
  },

  /**
   * Determines if object is explicit.
   * @param {Object} object
   * @returns {boolean}
   */
  isExplicit: function(object) {
    return Object.isSealed(object);
  },

  /**
   * Determines if object is strict.
   * @param {Object} object
   * @returns {boolean}
   */
  isStrict: function(object) {
    return ! Object.isExtensible(object);
  },

  /**
   * Determines if object is locked at the secret.
   * @param {Object} object
   * @returns {boolean}
   */
  isLocked: function(secret) {
    return !! this._locked[secret];
  },

  /**
   * Returns descriptor for the given level
   * @param {string} level
   * @param {?Object} [defaults]
   * @returns {*}
   */
  getLevelDescriptor: function(level, defaults) {
    var $descriptor = $fn.descriptor
      , descriptors = $descriptor.descriptors;
    if ($descriptor.hasLevel(level)) return descriptors[level];
    return $val(defaults, descriptors[$descriptor.defaults], $descriptor.canDescribe);
  },

  /**
   * Returns descriptor for the given level
   * @param {string} level
   * @param {?Object} [defaults]
   * @returns {*}
   */
  getDescriptor: function(alias, defaults) {
    var $descriptor = $fn.descriptor
      , descriptors = $descriptor.descriptors;
    if ($descriptor.hasDescriptor(alias)) return descriptors[alias];
    return $val(defaults, descriptors[$descriptor.defaults], $descriptor.canDescribe);
  },


  /**
   * Determines if level is registered
   * @param {string} level
   * @returns {boolean}
   */
  hasLevel: function(level) {
    return $fn.has(_.keys($fn.descriptor.levels), level);
  },

  /**
   * Determines if descriptor is registered using `alias`
   * @param {string} alias
   * @returns {boolean}
   */
  hasDescriptor: function(alias) {
    return $fn.has(_.keys($fn.descriptor.descriptors), alias);
  },

  /**
   * Determines if descriptor can be applied to the given object
   * @param {Object} object
   * @returns {boolean}
   */
  canDescribe: function(object) {
    return _.isObject(object);
  },
};
