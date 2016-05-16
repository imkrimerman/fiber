/**
 * Fiber Collection
 * @class
 * @extends {Collection}
 */
Fiber.Collection = BaseCollection.extend({

  /**
   * Model by default
   * @type {Fiber.Model}
   */
  model: Fiber.Model,

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|function(...)}
   */
  willExtend: ['model', 'url', 'eventsConfig'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['eventsConfig'],

  /**
   * Constructor
   * @param {Object[]|Array} models - Model to construct with
   * @param {?Object} [options] - Options to extend from
   */
  constructor: function(models, options) {
    _.isPlainObject(options) && this.extendModel(options.modelOptions);
    this.$superInit(models, options);
  },

  /**
   * Extends model with given options.
   * @param {Object} options
   * @returns {Fiber.Collection}
   */
  extendModel: function(options) {
    options = $val(options, false);
    if (! options) return this;
    this.model = this.model.extend(options);
    return this;
  },

  /**
   * Checks if collection is fetchable
   * @returns {boolean}
   */
  isSyncable: function() {
    return _.isString($result(this, 'url'));
  }
});
