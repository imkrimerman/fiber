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
    private: { enumerable: false, configurable: false, writable: false },
    protected: { enumerable: false, configurable: true, writable: false },
    public: { enumerable: true, configurable: true, writable: true },
    property: { enumerable: false, configurable: true, writable: true },
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
    return $isFn(object.getOwnPropertyDescriptor) && object.getOwnPropertyDescriptor(object, property) || {};
  },

  /**
   * Defines property using custom descriptor
   * @param {Object} object
   * @param {string|Object} property
   * @param {string|Object} descriptor
   * @param {Object} extender
   * @returns {Object}
   */
  define: function(object, property, descriptor, extender) {
    if (! $fn.descriptor.canDescribe(object)) return object;
    if ($isPlain(property)) return $fn.multi(property, function(oneDescriptor, key) {
      return $fn.descriptor.define(object, key, oneDescriptor, descriptor);
    }, function() {return object;});
    descriptor = $isStr(descriptor) ? $fn.macros.get(descriptor) : $val(descriptor, {}, $isPlain);
    return Object.defineProperty(object, property, $fn.merge(descriptor, extender));
  },

  /**
   * Defines property using registered macros
   * @param {Object} object
   * @param {string} property
   * @param {string|Array} macros
   * @param {Object} [extender]
   * @returns {Object}
   */
  defineMacros: function(object, property, macros, extender) {
    var macrosArgs = $isArr(macros) && $drop(macros) || []
      , macrosCreator = $fn.macros.get(macros)
      , descriptor = macrosCreator.apply(object, macrosArgs);
    return $fn.descriptor.define(object, property, descriptor, extender);
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
    if (! $isObj(object)) return object;
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
    if (! $isObj(object)) return object;
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
    return $fn.cast.toBoolean(this._locked[secret]);
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
    return $has(_.keys($fn.descriptor.levels), level);
  },

  /**
   * Determines if descriptor is registered using `alias`
   * @param {string} alias
   * @returns {boolean}
   */
  hasDescriptor: function(alias) {
    return $has(_.keys($fn.descriptor.descriptors), alias);
  },

  /**
   * Determines if descriptor can be applied to the given object
   * @param {Object} object
   * @returns {boolean}
   */
  canDescribe: function(object) {
    return $isObj(object);
  },
};
