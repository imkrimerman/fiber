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
   * Command own handler
   * @type {Function|Object.<Fiber.Handler>}
   */
  handler: null,

  /**
   * Properties keys that will be auto extended from initialize object
   * @var {Array|Function|string}
   */
  extendable: ['name', 'handler'],

  /**
   * Properties keys that will be owned by the instance
   * @var {Array|Function}
   */
  ownProps: ['name', 'handler', '__selfExecutable'],

  /**
   * Flag to set if command is self executable
   * @type {boolean}
   * @private
   */
  __selfExecutable: true,

  /**
   * Constructs Command
   */
  constructor: function() {
    this.execute = _.wrap(this.execute, _.bind(function(execFn) {
      return Fiber.fn.fireCallCyclic(this, 'execute', execFn, {fire: [this], call: [this]});
    }, this));

    this.__parent__.apply(this);

    if (! this.name) {
      Fiber.logs.system.errorReturn('Command must have unique `name` property and should be valid not empty string', this.name, this);
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
    if (! this.isSelfExecutable()) return false;
    return this.execute();
  },

  /**
   * Determines if command is self executable
   * @returns {boolean}
   */
  isSelfExecutable: function() {
    return this.__selfExecutable;
  },
});
