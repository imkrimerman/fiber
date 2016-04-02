/**
 * Fiber Transmitter Service
 * @class
 */
Fiber.Services.Transmitter = Fiber.fn.class.createWithExtensions({

  /**
   * Transmitter channels
   * @type {Object}
   */
  channels: {},

  /**
   * Properties keys that will be auto extended from initialize object
   * @var {Array|Function|string}
   */
  extendable: ['channels'],

  /**
   * Properties keys that will be owned by the instance
   * @var {Array|Function}
   */
  ownProps: ['channels'],

  /**
   * Returns events channel, if one is not exists with given `name`, it will be created
   * @param {string} name
   * @returns {Fiber.Events}
   */
  channel: function(name) {
    var channel = this.get('channels.' + name);

    if (! channel) {
      channel = Fiber.Events.copy();
      this.set('channels.' + name, channel);
    }

    return channel;
  },

  /**
   * Removes channel by name
   * @param {string} name
   * @returns {Fiber.Services.Events.Transmitter}
   */
  forget: function(name) {
    delete this.channels[name];
    return this;
  },
});