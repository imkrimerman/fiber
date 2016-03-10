Fiber.HistoryCollection = Fiber.RouterCollection.extend({

  /**
   * History size
   * @var {number}
   */
  historySize: 20,

  /**
   * Add a model, or list of models to the set. `models` may be Fiber
   * Models or raw JavaScript objects to be converted to Models, or any
   * combination of the two.
   *
   * Also checks history size and reduces it if needed
   *
   * @param {Object.<Fiber.Model>|Array} models
   * @param {?Object} [options]
   */
  add: function(models, options) {
    this.handleSize();
    Fiber.fn.apply(Fiber.RouterCollection, 'add', arguments);
  },

  /**
   * Handles size of the history collection
   * @return {Fiber.HistoryCollection}
   */
  handleSize: function() {
    if (this.length >= this.historySize) this.shift();
    return this;
  }
});
