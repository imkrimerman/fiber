/**
 * Extend extension.
 * @type {Object}
 */
var $Extend = new Fiber.Extension({

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initMethodName: 'applyExtend',

  /**
   * Properties keys that will be auto extended from initialize object
   * @var {Array|Function|string}
   */
  extendable: [],

  /**
   * Extends options object. Only options from `extendable` keys array will be extended.
   * @param {Object} options
   * @returns {*}
   */
  applyExtend: function(options) {
    options = val(options, {});
    var extendable = _.result(this, 'extendable');
    if (_.isString(extendable) && extendable === 'all') return _.extend(this, options);
    else if (_.isArray(extendable)) {
      if (_.isArray(options.extendable)) extendable = extendable.concat(options.extendable);
      return _.extend(this, _.pick(options, _.compact(extendable)));
    }
    return this;
  }
});
