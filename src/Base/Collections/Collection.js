/**
 * Base Collection
 * @class
 * @extends {Backbone.Collection}
 */
$Collection = $fn.class.extend(Backbone.Collection, [
  $Extend, $OwnProps, $Binder, {

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function}
   */
  willExtend: ['model', 'url'],

  /**
   * Base model
   * @type {$Model}
   */
  model: $Model,

  /**
   * Constructor
   * @param {Object[]|Array} models - Model to construct with
   * @param {?Object} [options] - Options to extend from
   */
  constructor: function(models, options) {
    $fn.class.handleOptions(this, options);
    $fn.extensions.init(this, {list: ['Extend', 'OwnProps', 'Binder']});
    Backbone.Collection.apply(this, arguments);
  },
}]);
