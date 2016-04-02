/**
 * Fiber Collection
 * @class
 * @extends {BaseCollection}
 */
Fiber.Collection = BaseCollection.extend([
  'Extensions', 'Binder', {

    /**
     * Model by default
     * @var {Fiber.Model}
     */
    model: Fiber.Model,

    /**
     * Properties keys that will be auto extended from initialize object
     * @var {Array|Function}
     */
    extendable: ['model', 'url', 'ns', 'catalog'],

    /**
     * Properties keys that will be owned by the instance
     * @var {Array|Function}
     */
    ownProp: ['ns', 'catalog'],

    /**
     * Constructor
     * @param {Object[]|Array} models - Model to construct with
     * @param {?Object} [options] - Options to extend from
     */
    constructor: function(models, options) {
      Fiber.fn.class.handleOptions(this, options);
      Fiber.initializeExtensions(this);
      this.extendModel(options.modelOptions);
      this.__parent__.apply(this, arguments);
    },

    /**
     * Extends model with given options.
     * @param {Object} options
     * @returns {Fiber.Collection}
     */
    extendModel: function(options) {
      options = val(options, false);
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
