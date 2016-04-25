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
   * @type {Array|Function|string|boolean}
   */
  willExtend: [],

  /**
   * Extends options object. Only options from `willExtend` keys array will be extended.
   * @param {Object} options
   * @returns {*}
   */
  applyExtend: function(options) {
    options = $val(options, {});
    var willExtend = _.result(this, 'willExtend')
      , passedWillExtend = options.willExtend && $fn.castArr(options.willExtend) || [];

    if (! willExtend) return this;

    if (_.isBoolean(willExtend) && willExtend || _.isString(willExtend) && willExtend === 'all')
      return _.extend(this, options);

    willExtend = willExtend.concat(passedWillExtend);
    return _.extend(this, _.pick(options, _.compact(willExtend)));
  }
});

/**
 * Register Extension
 */
$fn.extensions.register($Extend);
