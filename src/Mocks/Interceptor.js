/**
 * Mocks Transmitter
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Mocks.Transmitter = Fiber.Class.extend({

  /**
   * Constructs Mock Transmitter.
   * @param {Object.<Fiber.Model>|Object.<Fiber.Collection>} syncable
   * @param {Object} [options]
   */
  constructor: function(syncable, options) {
    this._syncable = null;
    $fn.handleOptions(this, options);
    this.setSyncable(syncable);
    this.$superInit(options);
  },

  /**
   * Sets `syncable` object.
   * @param {Object.<Fiber.Model>|Object.<Fiber.Collection>} syncable
   * @returns {Fiber.Mocks.Transmitter}
   */
  setSyncable: function(syncable) {
    if ($fn.class.isSyncable(syncable)) this._syncable = syncable;
    return this;
  },

  /**
   * Returns syncable object.
   * @returns {null|*|Object.<Fiber.Model>|Object.<Fiber.Collection>}
   */
  getSyncable: function() {
    return this._syncable;
  },

  /**
   * Determines if syncable is set and is valid.
   * @returns {boolean}
   */
  hasSyncable: function() {
    return ! _.isEmpty(this._syncable);
  }
});
