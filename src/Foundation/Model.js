/**
 * Base Model
 * @class
 * @extends {Backbone.Model}
 * @private
 */
var BaseModel = $fn.class.make(Backbone.Model, [
  $Events, $Extend, $OwnProps, $Binder, {

    /**
     * Model constructor
     * @param {Object} attributes
     * @param {?Object} [options]
     */
    constructor: function(attributes, options) {
      this.resetEventProperties();
      $fn.class.handleOptions(this, options);
      $fn.extensions.init(this);
      this.$superInit(arguments);
    },
  }
]);
