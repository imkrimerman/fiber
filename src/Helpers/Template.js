/**
 * Fiber Template support
 * @var {Object}
 */
Fiber.fn.template = {

  /**
   * Template engine
   * @var {Function}
   * @private
   */
  engine: _.template,

  /**
   * Fallback function that emulates template engine
   * @var {Function}
   */
  fallback: function(val) { return val; },

  /**
   * Templates string with given arguments
   * @returns {string}
   */
  compile: function(template, data) {
    return this.wrap(template)(data);
  },

  /**
   * Prepares template to compile
   * @param {string} template - Template to wrap
   * @returns {Function}
   */
  wrap: function(template) {
    var engine = Fiber.fn.template.getEngine()
    // lets use all arguments and path them into the engine
      , prepared = engine.apply(engine, arguments);
    // adds static render function to the prepared template
    prepared.render = function() {
      return prepared.apply(prepared, arguments);
    };
    // and finally return wrapped template
    return prepared;
  },

  /**
   * Returns template engine
   * @returns {Function}
   */
  getEngine: function() {
    var engine = Fiber.fn.template.engine;
    if (! engine) return Fiber.fn.template.getFallback();
    return engine;
  },

  /**
   * Sets template engine
   * @param {Function} engine
   * @return {Fiber.fn.template}
   */
  setEngine: function(engine) {
    if (! _.isFunction(engine)) return this;
    Fiber.fn.template.engine = engine;
    return this;
  },

  /**
   * Checks if template engine is valid and not the fallback one
   * @returns {boolean}
   */
  hasEngine: function() {
    var engine = Fiber.fn.template.getEngine();
    if (! engine || engine === Fiber.fn.template.fallback) return false;
    return true;
  },

  /**
   * Returns fallback template engine. Tries to return lodash template or
   * constant function that emulate templating
   * @returns {Function}
   */
  getFallback: function() {
    try {
      // Try to wrap `template` string in `_.template` function,
      // if it's not available then wrap it with function that will
      // return the same value that is used as the argument.
      return _ && _.template ? _.template : Fiber.fn.template.fallback;
    } catch(e) { return Fiber.fn.template.fallback; }
  },

  /**
   * Sets fallback template engine
   * @param {Function} fallback
   * @returns {Fiber.fn.template}
   */
  setFallback: function(fallback) {
    this.fallback = fallback;
    return this;
  }
};