// Extendable extension.
Fiber.addExtension('Extendable', {

  // Properties keys that will be auto extended from initialize object
  extendable: [],

  // Extends options object. Only options from `extendable` keys array will be extended.
  applyExtendable: function(options) {
    var extendable = _.extend(this.result('extendable'), options.extendable || {});
    return _.extend(this, _.pick(options, extendable));
  }
});
