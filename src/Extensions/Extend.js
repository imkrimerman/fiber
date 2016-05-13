/**
 * Extend Extension
 *
 * Extension that automatically merges bound context with provided object.
 * Can be configured using willExtend property of the context or with
 * options.willExtend property that can be array or string.
 *
 * @type {Object.<Fiber.Extension>}
 */
var $Extend = new Fiber.Extension('Extend', {

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initWith: 'applyExtend',

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|function()|string|boolean}
   */
  willExtend: [],

  /**
   * Extends options object. Only options from `willExtend` keys array will be extended.
   * @param {Object} options
   * @returns {*}
   */
  applyExtend: function(options) {
    $fn.class.extendFromOptions(this, $val(options, {}), $fn.result(this, 'willExtend', []));
  }
});

/**
 * Register Extension
 */
$Ioc.extension('Extend', $Extend);
