/**
 * Fiber Command
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Services.Commands.Command = Fiber.Bag.extend({

  /**
   * Command name
   * @type {string|Function}
   */
  name: '',

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function|string}
   */
  extendable: ['name'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['name', 'selfExecutable'],

  /**
   * Flag to set if command is self executable
   * @type {boolean}
   */
  selfExecutable: true,

  /**
   * Constructs Command
   */
  constructor: function() {
    this.__parent__.apply(this, arguments);

    this.execute = Fiber.fn.wrapFireCallCyclic(this.execute, 'execute', {
      fire: [this], call: [this]
    });

    if (! this.name) {
      Fiber.logs.system.errorReturn('Command must have unique `name` property and should ' +
                                    'be valid not empty string', this.name, this);
    }
  },

  /**
   * Executes command if is self executable
   */
  execute: function() {
    return this;
  },

  /**
   * Returns execute result if allowed or false otherwise
   * @returns {boolean|*}
   */
  executeIfAllowed: function() {
    if (! this.selfExecutable) return false;
    return this.execute();
  },

});
