/**
 * Mixin extension.
 * Functions that provides including and mixining objects and array of objects
 * @var {Object}
 */
var $Mixin = {

  /**
   * Adds given `mixin` to Fiber Class. Mixin can be object or function.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|Function} mixin
   * @param {?boolean} [override=false]
   * @returns {*}
   */
  mix: function(mixin, override) {
    Fiber.fn.class.mix(this, mixin, override);
    return this;
  },

  /**
   * Mixes Fiber Class to given `object`.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object} object
   * @param {?boolean} [override=false]
   * @returns {*}
   */
  mixTo: function(object, override) {
    Fiber.fn.class.mix(object, this, override);
    return this;
  },

  /**
   * Includes `mixin` or array of mixins to Fiber Class.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|Function|Array} mixin
   * @param {?boolean} [override=false]
   * @returns {*}
   */
  include: function(mixin, override) {
    return Fiber.fn.class.include(this, mixin, override);
  },

  /**
   * Applies Fiber extension to the Class to provide more flexibility
   * @param {string} alias
   * @param {?boolean} [override=false]
   */
  applyExtension: function(alias, override) {
    Fiber.applyExtension(alias, this, override);
  }
};
