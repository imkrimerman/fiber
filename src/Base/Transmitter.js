/**
 * Fiber Transmitter Service
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Transmitter = Fiber.Bag.extend({

  /**
   * Key that will dynamically created to store items
   * @type {string|Function}
   * @private
   */
  __holderKey: 'channels',

  /**
   * Returns events channel, if one is not exists with given `name`, it will be created
   * @param {string} name
   * @returns {Fiber.Events}
   */
  channel: function(name) {
    if (this.has(name)) return this.get(name);
    return this.create(name);
  },

  /**
   * Creates new channel by `name`
   * @param {string} name
   * @returns {Fiber.Events}
   */
  create: function(name) {
    var channel = Fiber.Events.instance();
    this.set(name, channel);
    return channel;
  },
});
