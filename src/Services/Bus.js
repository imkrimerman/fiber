/**
 * Fiber Command Bus
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Services.Bus = Fiber.fn.class.createClassWithExtensions({

  /**
   * Commands Registry
   * @type {Object.<Fiber.Collection>}
   */
  registry: null,

  extendable: [],

  ownProps: ['registry'],

  constructor: function(options) {
    options = val(options, {}, _.isPlainObject);
    this.createRegistryCollection(options.commands);
    this.__parent__.apply(this, arguments);
  },

  add: function() {},

  remove: function() {},

  execute: function(command) {

  },

  createRegistryCollection: function(options) {
    return this.registry = new Fiber.Collection(val(options, [], _.isArray));
  },

});
