/**
 * Fiber Collection
 * @class
 * @extends {BaseCollection}
 */
Fiber.Collection = BaseCollection.extend(['Mixins', 'Binder', {

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
    this.options = options;
    Fiber.initializeExtensions(this);
    Backbone.Collection.apply(this, arguments);
  },

  /**
   * Checks if collection is fetchable
   * @returns {boolean}
   */
  isFetchable: function() {
    return _.isString(this.result('url'));
  }
}]);
