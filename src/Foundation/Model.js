/**
 * Base Model
 * @class
 * @extends {Backbone.Model}
 * @private
 */
BaseModel = $fn.class.make(Backbone.Model, [
  $Extend, $Events, $OwnProps, {

    /**
     * Model constructor
     * @param {Object} attributes
     * @param {?Object} [options]
     */
    constructor: function(attributes, options) {
      $fn.class.handleOptions(this, options);
      $fn.extensions.init(this);
      this.$superInit(arguments);
    },
  }
]);
