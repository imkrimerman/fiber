/**
 * Fiber Base Collection
 * @class
 * @extends {Backbone.Collection}
 */
Fiber.BaseCollection = Fiber.fn.class.makeExtended('Collection', {

  /**
   * Properties keys that will be auto extended from initialize object
   * @var {Array|Function}
   */
  extendable: ['model', 'url', 'eventsNs', 'eventsCatalog'],

  /**
   * Properties keys that will be owned by the instance
   * @var {Array|Function}
   */
  ownProp: ['eventsNs', 'eventsCatalog'],

  /**
   * Constructor
   * @param {Object[]|Array} models - Model to construct with
   * @param {?Object} [options] - Options to extend from
   */
  constructor: function(models, options) {
    this.applyExtend(options);
    this.applyOwnProps();
    Backbone.Collection.apply(this, arguments);
  }
});

/**
 * Mixes extend method
 * @static
 */
Fiber.fn.class.mixExtend(Fiber.BaseCollection);
