/**
 * Fiber Template support
 * @type {Object}
 */
Fiber.fn.template = {

  /**
   * Template engine
   * @type {Function}
   * @private
   */
  engine: $Const.template.engine,

  /**
   * Fallback function that emulates template engine renderer
   * @type {Function}
   */
  fallback: _.identity,

  /**
   * Templates string with given arguments
   * @returns {string}
   */
  compile: function(template, data) {
    return this.prepare(template)(data);
  },

  /**
   * Prepares template to compile
   * @param {string} template - Template to prepare
   * @returns {Function}
   */
  prepare: function(template) {
    var engine = $fn.template.getEngine()
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
   * Adds global template import to the `data`
   * @param {?Object} [data={}]
   * @returns {Object}
   */
  imports: function(data) {
    return _.extend({}, $val(data || {}), $Const.template.imports);
  },

  /**
   * Returns template engine
   * @returns {Function}
   */
  getEngine: function() {
    var engine = $fn.template.engine;
    if (! engine) return $fn.template.getFallback();
    return engine;
  },

  /**
   * Sets template engine
   * @param {Function} engine
   * @return {Fiber.fn.template}
   */
  setEngine: function(engine) {
    if (! _.isFunction(engine)) return this;
    $fn.template.engine = engine;
    return this;
  },

  /**
   * Checks if template engine is valid and not the fallback one
   * @returns {boolean}
   */
  hasEngine: function() {
    var engine = $fn.template.getEngine();
    if (! engine || engine === $fn.template.fallback) return false;
    return true;
  },

  /**
   * Returns fallback template engine. Tries to return lodash template or
   * `identity` function that emulate templating
   * @returns {Function}
   */
  getFallback: function() {
    var result = _.attempt(function() {
      // Try to prepare `template` string in `_.template` function,
      // if it's not available then prepare it with function that will
      // return the same value that is used as the argument.
      return _ && _.template ? _.template : $fn.template.fallback;
    });

    if (_.isError(result)) return $fn.template.fallback;
    return result;
  },

  /**
   * Sets fallback template engine
   * @param {Function} fallback
   * @returns {Fiber.fn.template}
   */
  setFallback: function(fallback) {
    this.fallback = fallback;
    return this;
  },

  /**
   * Determines if fallback exists and is valid function
   * @returns {boolean}
   */
  hasFallback: function() {
    return _.isFunction(this.getFallback());
  },
};

_.extend(_.templateSettings, $Const.template.settings);
_.extend(_.templateSettings.imports, $fn.template.imports());
