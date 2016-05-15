/**
 * Fiber Command
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.Commands.Command = Fiber.Bag.extend([
  $OwnProps, $Binder, {

    /**
     * Flag to set if command is self executable
     * @type {boolean}
     */
    selfExecutable: false,

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|function(...)}
     */
    ownProps: ['selfExecutable'],

    /**
     * Events configuration
     * @type {Object}
     */
    eventsConfig: {

      /**
       * Events catalog to hold the events
       * @type {Object}
       */
      catalog: {
        beforeExecute: 'before:execute',
        execute: 'execute',
        afterExecute: 'after:execute'
      }
    },

    /**
     * Constructs Command
     * @param {Object} [options]
     */
    constructor: function(items, isSelfExecutable) {
      this.$superInit(items);
      this.selfExecutable = $val(isSelfExecutable, ! this.has('handler'), _.isBoolean);
      this.execute = $fn.wrapFireCallCyclic(this.execute, 'execute', { fire: [this], call: [this] });
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

    /**
     * Determines if command is self executable
     * @returns {boolean}
     */
    isSelfExecutable: function() {
      return this.selfExecutable || _.isFunction(this.get('handler'));
    },
  }
]);
