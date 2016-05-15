/**
 * Base Collection
 * @class
 * @extends {Backbone.Collection}
 * @private
 */
var BaseCollection = $fn.class.make(Backbone.Collection, [
  $Events, $Extend, $OwnProps, $Binder, {

    /**
     * Properties keys that will be auto extended from initialize object
     * @type {Array|function(...)}
     */
    willExtend: ['model', 'url'],

    /**
     * Base model
     * @type {BaseModel}
     */
    model: BaseModel,

    /**
     * Constructor
     * @param {Object[]|Array} models - Model to construct with
     * @param {?Object} [options] - Options to extend from
     */
    constructor: function(models, options) {
      this.resetEventProperties();
      $fn.class.handleOptions(this, options);
      $fn.extensions.init(this);
      this.$superInit(arguments);
    }
  }
]);
