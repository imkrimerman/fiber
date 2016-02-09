// Mixin extension.
// Functions that provides including and mixining objects and array of objects
Fiber.addExtension('Mixin', {

  // Includes `mixin` or array of mixins to Fiber Class.
  // Also you can provide `override` boolean to force override properties.
  include: function(mixin, override) {
    if (! _.isArray(mixin) && _.isPlainObject(mixin))
      this.mix(mixin, override);
    else for (var i = 0; i < mixin.length; i ++)
      this.mix(mixin[i], override);
    return this;
  },

  // Adds given `mixin` to Fiber Class. Mixin can be object or function.
  // Also you can provide `override` boolean to force override properties.
  mix: function(mixin, override) {
    override = val(override, false);
    // If function is given then it will be called with current Class.
    if (_.isFunction(mixin)) {
      mixin(this);
      return this;
    }
    var method = 'defaultsDeep';
    if (override) method = 'assign';
    _[method](this, mixin);
    return this;
  },

  // Mixes Fiber Class to given `object`.
  // Also you can provide `override` boolean to force override properties.
  mixTo: function(object, override) {
    this.mix.call(object, this, override);
  }
});
