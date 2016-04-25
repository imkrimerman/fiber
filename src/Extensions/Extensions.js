/**
 * `Extensions` extension. Brings power of mutability and mixins to the class.
 * Automatically
 * @type {Object.<Fiber.Extension>}
 */
var $Extensions = new Fiber.Extension('Extensions', {

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initWith: 'applyExtensions',

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|Function|string|boolean}
   */
  willExtend: ['extensions'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['extensions'],

  /**
   * Extensions to auto resolve and initialize. On construct Fiber will resolve
   * this extensions list, include and initialize resolved extensions
   * @type {Array|Function}
   */
  extensions: [],

  /**
   * Applies extensions of the current object
   * @param {?Array} [extensions]
   */
  applyExtensions: function(extensions) {
    extensions = val(extensions, false, _.isArray) || _.result(this, 'extensions');
    if (extensions) this.includeExtension(extensions);
  },

  /**
   * Adds given `mixin` to Fiber Class. Mixin can be object or function.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|Function} mixin
   * @param {?boolean} [override=false]
   * @returns {Object}
   */
  mix: function(mixin, override) {
    fn.class.mix(this, mixin, override);
    return this;
  },

  /**
   * Mixes Fiber Class to given `object`.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object} object
   * @param {?boolean} [override=false]
   * @returns {Object}
   */
  mixTo: function(object, override) {
    fn.class.mix(object, this, override);
    return this;
  },

  /**
   * Includes `mixin` or array of mixins to Fiber Class.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|Function|Array} mixin
   * @param {?boolean} [override=false]
   * @returns {Object}
   */
  include: function(mixin, override) {
    return fn.class.include(this, mixin, override);
  },

  /**
   * Includes Fiber extension to the Class to provide more flexibility
   * @param {string} alias
   * @param {?boolean} [override=false]
   * @return {Object}
   */
  includeExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
    return this;
  }
});


/**
 * Register Extension
 */
fn.extensions.register($Extensions);
