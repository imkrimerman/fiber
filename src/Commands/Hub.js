/**
 * Fiber Command Hub
 * @class
 */
Fiber.Commands.Hub = $fn.class.createWithExtensions({

  /**
   * Commands Registry
   * @type {Object.<Fiber.Collection>}
   */
  registry: null,

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function|string}
   */
  willExtend: ['registry'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['registry'],

  /**
   * Constructs Command Hub
   * @param {?Object} [options={}]
   */
  constructor: function(options) {
    options = $val(options, {}, _.isPlainObject);
    this.createRegistry(options.commands);
    this.__parent__.apply(this, arguments);
  },

  /**
   * Adds `command` by `name`
   * @param {string} name
   * @param {Object.<Fiber.Command>} command
   * @returns {Fiber.Commands.Hub}
   */
  link: function(name, command, handler) {
    this.registry.add({name: name, command: command, handler: $val(handler, null)});
    return this;
  },

  /**
   * Removes registered command
   * @param {string} name
   * @returns {boolean}
   */
  unlink: function(name) {
    if (! this.registry.has(name)) return false;
    this.registry.remove(name);
    return true;
  },

  /**
   * Executes command
   * @param {string|Object.<Fiber.Command>} commandModel
   * @returns {*}
   */
  execute: function(command) {
    if (_.isString(command)) command = this.registry.get(command);
    // if we also have handler for the command
    if (command instanceof Fiber.Commands.Command) {
      // if we don't have any handler, then let's try to execute command,
      if (! command.has('handler')) return command.executeIfAllowed();
      // then lets retrieve it
      var Handler = command.get('handler'), handler;
      // if is function then just call it with `command` and return
      if (_.isFunction(Handler)) return Handler(command);
      // if is Class constructor
      if ($fn.class.is(Handler)) {
        // then let's instantiate new Handler with `command` as argument
        handler = new Handler(command);
        // and trigger handle method on command
        return handler.handle(command, this);
      }
    }
    return $Log.errorReturn('Can\'t execute command', command, this);
  },

  /**
   * Creates and sets registry collection with provided models and options.
   * @param {?Array} [models=[]]
   * @param {?Object} [options]
   * @returns {Backbone.Collection|e.Collection|*}
   */
  createRegistry: function(models, options) {
    return this.registry = new Fiber.Commands.Registry($val(models, [], _.isArray), options);
  }
});
