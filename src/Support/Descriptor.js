/**
 * Access descriptors Support
 * @type {Object}
 */
Fiber.fn.descriptor = {

  _private: {
    locked: {},
    defaults: 'public'
  },

  /**
   * Locked objects registry
   * @type {Object}
   * @private
   */
  _locks: {},

  /**
   * Defaults
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
    protected: {enumerable: true, configurable: true, writable: false},
    public: {enumerable: true, configurable: true, writable: true}
  },

  /**
   * Macros holder
   * @type {Object}
   */
  macros: {
    'get/set': function(property, checkToSetFn) {
      return {
        get: function() {
          return this[property];
        },
        set: function(value) {
          if (_.isString(checkToSetFn) && _.isFunction(_.get(this, checkToSetFn))) checkToSetFn = this[checkToSetFn];
          if ((_.isFunction(checkToSetFn) && checkToSetFn(value)) || ! $isDef(checkToSetFn)) {
            this[property] = value;
          }
        }
      };
    }
  },

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
      , isObj = _.isPlainObject(property)
      , getLevel = $fn.descriptor.getLevelDescriptor;

    if (arguments.length === 3) args.push(getLevel(level));
    else if (arguments.length === 2 && isObj) {
      for (var propName in property) properties[propName] = getLevel(property[name]);
      args.push(properties);
    }
    return $fn.descriptor.define.apply(null, args);
  },

  /**
   * Defines property using custom descriptor
   * @param {Object} object
   * @param {string} property
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
   * Defines property using registered macros
   * @param {Object} object
   * @param {string} property
   * @param {Object} macros
   * @returns {Object}
   */
  defineMacros: function(object, property, macros, macrosArgs) {
    if (! $fn.descriptor.hasMacros(macros)) return object;
    macrosArgs = $fn.castArr($val(macrosArgs, []));
    var macrosCreator = $fn.descriptor.getMacros(macros)
      , descriptor = macrosCreator.apply(object, macrosArgs);
    if (_.isFunction(macrosCreator)) return $fn.descriptor.define(object, property, descriptor);
    $Log.error(macros + ' is not found.');
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
      return $fn.descriptor._locks[secret];

    var locked = $fn.descriptor.immutable($fn.clone(object, true));

    $fn.descriptor._locks[secret] = {
      original: object,
      locked: locked
    };

    return locked;
  },

  /**
   * Unlocks object and removes it from Fiber State container.
   * @param {string} secret
   * @param {Object} object
   * @returns {Object}
   */
  unlock: function(secret, object) {
    if (! $fn.descriptor.canDescribe(object) || ! $fn.descriptor.isLocked(secret))
      return object;

    var locked = $fn.descriptor._locks[secret]
      , original = locked.original;

    delete $fn.descriptor._locks[secret];
    return original;
  },

  /**
   * Determines if macros is registered
   * @param {string} macros
   * @returns {boolean}
   */
  hasMacros: function(macros) {
    return _.has($fn.descriptor.macros, macros);
  },

  /**
   * Returns registered macros
   * @param {string} macros
   * @param {*} [defaults]
   * @returns {Function}
   */
  getMacros: function(macros, defaults) {
    return _.get($fn.descriptor.macros, macros, defaults);
  },

  /**
   * Registers macros
   * @param {string} macros
   * @param {Function} creator
   * @return {Fiber.fn.descriptor}
   */
  setMacros: function(macros, creator) {
    _.set($fn.descriptor.macros, macros, creator);
    return this;
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
    return Fiber.state.has($fn.descriptor.state, secret);
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
   * Determines if level is registered
   * @param {string} level
   * @returns {boolean}
   */
  hasLevel: function(level) {
    return _.has(_.keys($fn.descriptor.levels), level)
  },

  /**
   * Determines if descriptor can be applied to the given object
   * @param {Object} object
   * @returns {boolean}
   */
  canDescribe: function(object) {
    return _.isPlainObject(object);
  },
};
