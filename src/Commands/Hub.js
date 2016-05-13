/**
 * Fiber Command Hub
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Commands.Hub = Fiber.Class.extend({

  /**
   * Commands Registry
   * @type {Object.<BaseCollection>}
   * @private
   */
  _registry: null,

  /**
   * Constructs Command Hub
   * @param {Array} [commands=[]]
   */
  constructor: function(commands) {
    this._registry = new Fiber.Commands.Registry($val(commands, [], _.isArray));
    this.$superInit();
  },

  /**
   * Returns registered command by `name`
   * @param {string} name
   * @returns {Object.<Fiber.Command>|null}
   */
  get: function(name) {
    return this._registry.get(name);
  },

  /**
   * Sets `command`
   * @param {string} name
   * @param {Object.<Fiber.Command>} command
   * @returns {Fiber.Commands.Hub}
   */
  set: function(name, command, handler) {
    this._registry.add({name: name, command: command, handler: $val(handler, null)});
    return this;
  },

  /**
   * Determines if command is registered with the given `name`
   * @param {string} name
   * @returns {boolean}
   */
  has: function(name) {
    return this._registry.has(name);
  },

  /**
   * Removes registered `command`
   * @param {string} name
   * @returns {boolean}
   */
  forget: function(name) {
    if (! this._registry.has(name)) return false;
    this._registry.remove(name);
    return true;
  },

  /**
   * Executes `command`
   * @param {string|Object.<Fiber.Command>} command
   * @returns {*}
   */
  execute: function(command) {
    if (_.isString(command)) command = this.get(command);
    // if we also have handler for the command
    if (command instanceof Fiber.Commands.Command) {
      // if we don't have any handler, then let's try to execute command,
      if (! command.isSelfExecutable()) return command.executeIfAllowed();
      // then lets retrieve it
      var Handler = command.get('handler');
      // if is function then just call it with `command` and return
      if (_.isFunction(Handler)) return Handler(command);
      // if Handler is string then we'll try to make it using IOC container
      if (_.isString(Handler) && $Ioc.bound(Handler)) Handler = $Ioc.make(Handler);
      // if is Class constructor
      if ($fn.class.isClass(Handler)) {
        // then let's instantiate new Handler with `command` as argument
        var handler = new Handler(command);
        // and trigger handle method on command
        return handler.handle(command, this);
      }
    }
    return $Log.errorReturn('Can\'t execute command. Handler is not valid.', command, this);
  }
});
