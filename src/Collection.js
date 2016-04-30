/**
 * Fiber Collection
 * @class
 * @extends {Collection}
 */
Fiber.Collection = $Collection.extend([
  'Extensions', 'Binder', {

    /**
     * Model by default
     * @type {Fiber.Model}
     */
    model: Fiber.Model,

    /**
     * Properties keys that will be auto extended from initialize object
     * @type {Array|Function}
     */
    willExtend: ['model', 'url', 'ns', 'catalog'],

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|Function}
     */
    ownProps: ['ns', 'catalog'],

    /**
     * Constructor
     * @param {Object[]|Array} models - Model to construct with
     * @param {?Object} [options] - Options to extend from
     */
    constructor: function(models, options) {
      $fn.class.handleOptions(this, options);
      $fn.extensions.init(this, options);
      this.extendModel(options.modelOptions);
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
    isFetchable: function() {
      return _.isString(this.result('url'));
    }
  }
]);
