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
   * @type {Array|function(...)|string|boolean}
   */
  willExtend: ['extensions'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['extensions'],

  /**
   * Extensions to auto resolve and initialize. On construct Fiber will resolve
   * this extensions list, include and initialize resolved extensions
   * @type {Array|function(...)}
   */
  extensions: [],

  /**
   * Applies extensions of the current object
   * @param {?Array} [extensions]
   * @return {Object}
   */
  applyExtensions: function(extensions) {
    extensions = $val(extensions, [], _.isArray).concat($castArr($fn.result(this, 'extensions')));
    return this.includeExtension(extensions);
  },

  /**
   * Adds given `mixin` to Fiber Class. Mixin can be object or function.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|function(...)} mixin
   * @param {?boolean} [override=false]
   * @returns {Object}
   */
  mix: function(mixin, override) {
    $fn.class.mix(this, mixin, override);
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
    $fn.class.mix(object, this, override);
    return this;
  },

  /**
   * Includes `mixin` or array of mixins to Fiber Class.
   * Also you can provide `override` boolean to force override properties.
   * @param {Object|function(...)|Array} mixin
   * @param {?boolean} [override=false]
   * @returns {Object}
   */
  include: function(mixin, override) {
    return $fn.class.include(this, mixin, override);
  },

  /**
   * Includes Fiber extension to the Class to provide more flexibility
   * @param {string} alias
   * @param {?boolean} [override=false]
   * @return {Object}
   */
  includeExtension: function(alias, override) {
    alias = $castArr(alias);
    if ($fn.has(alias, 'Extensions')) alias.splice(alias.indexOf('Extensions'), 1);
    var options = { override: override || false, init: true, list: [], args: {} }
      , extension = $fn.extensions.get(alias, false);
    if (_.isEmpty(extension)) return this;
    $fn.class.include(this, extension, options.override);
    $fn.extensions.setIncluded(this, alias);
    $fn.extensions.init(this, alias, options.args);
    return this;
  }
});

/**
 * Register Extension
 */
$Ioc.extension('Extensions', $Extensions);
