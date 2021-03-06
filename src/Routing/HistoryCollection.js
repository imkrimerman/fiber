/**
 * Fiber History Collection
 * @class
 * @extends {$RouterCollection}
 */
Fiber.HistoryCollection = $RouterCollection.extend({

  /**
   * Default Model
   * @type {History}
   */
  model: Fiber.HistoryItem,

  /**
   * History size
   * @type {number}
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
    return this.$super('add', arguments);
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
