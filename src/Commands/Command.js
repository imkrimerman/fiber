/**
 * Fiber Command
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Commands.Command = Fiber.Bag.extend({

  /**
   * Command name
   * @type {string|Function}
   */
  name: '',

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function|string}
   */
  willExtend: ['name'],

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
   * @param {Object} [storable]
   * @param {?Object} [options]
   */
  constructor: function(storable, options) {
    this.$superInit(storable, options);
    this.execute = $fn.wrapFireCallCyclic(this.execute, 'execute', {
      fire: [this], call: [this]
    });

    if (! this.name) {
      $Log.errorReturn('Command must have unique `name` property and should ' +
                       'be valid and not empty string', this.name, this);
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
