/**
 * Fiber Template support
 * @type {Object}
 * @memberof Fiber.fn#
 */
Fiber.fn.template = {

  /**
   * Template engine
   * @var {Function}
   * @memberof Fiber.fn.template#
   */
  engine: _.template,

  /**
   * Templates string with given arguments
   * @returns {string}
   * @memberof Fiber.fn.template#
   */
  compile: function(template, data) {
    return this.prepare(template)(data);
  },

  /**
   * Prepares template to compile
   * @param {string} template - Template to prepare
   * @returns {Function}
   * @memberof Fiber.fn.template#
   */
  prepare: function(template) {
    var engine = Fiber.fn.template.engine;
    // if template engine is not available then try to wrap `template` string
    // in `_.template` function, if it's not available too then wrap it with function that will
    // return the same value that is used as the argument.
    if (! engine) return _.template ? _.template(template) : _.constant(template);
    // otherwise lets use all arguments and path them to the engine
    return engine.apply(engine, arguments);
  },

};
