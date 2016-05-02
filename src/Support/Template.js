/**
 * Fiber Template support
 * @type {Object}
 */
Fiber.fn.template = {

  /**
   * Private configuration
   * @type {Object}
   */
  __private: {

    /**
     * Template engine
     * @type {Function}
     * @private
     */
    engine: _.template,

    /**
     * System template engine
     * @type {Function}
     * @private
     */
    system: _.template,

    /**
     * Fallback template engine
     * @type {Function}
     * @private
     */
    fallback: _.constant,

    /**
     * Available engines list
     * @type {Array}
     */
    engines: ['engine', 'system', 'fallback'],

    /**
     * Template settings
     * @type {Object}
     */
    settings: {
      evaluate: /{{([\s\S]+?)}}/g,
      interpolate: /{{=([\s\S]+?)}}/g,
      escape: /{{-([\s\S]+?)}}/g,
      imports: {
        Fiber: Fiber,
        Fr: Fiber,
        $fn: Fiber.fn,
        $each: $each,
        $val: $val,
        $valMerge: $valMerge,
        $isDef: $isDef
      }
    },
  },

  /**
   * Templates string with given arguments using main engine
   * @param {string} template
   * @param {?Object} [data]
   * @return {string}
   */
  compile: function(template, data) {
    return $fn.template.prepare(template, 'engine')(data);
  },

  /**
   * Templates string with given arguments using system engine
   * @param {string} template
   * @param {?Object} [data]
   * @return {string}
   */
  system: function(template, data) {
    return $fn.template.prepare(template, 'system')(data);
  },

  /**
   * Templates string with given arguments using fallback engine
   * @param {string} template
   * @param {?Object} [data]
   * @return {string}
   */
  fallback: function(template, data) {
    return $fn.template.prepare(template, 'fallback')(data);
  },

  /**
   * Prepares template to compile
   * @param {string} template - Template to prepare
   * @param {?string} [type='engine']
   * @returns {Function}
   */
  prepare: function(template, type) {
    type = $val(type, 'engine', $fn.createIncludes($private($fn.template, '__engines')));
    var engine = $fn.template['get' + _.capitalize(type)]();
    // if engine is not found then lets wrap to return the same
    if (! _.isFunction(engine)) return _.constant(template);
    // otherwise lets use all arguments and path them into the engine
    var prepared = engine.apply(engine, arguments);
    // adds static render function to the prepared template
    prepared.$render = function() {
      return prepared.apply(prepared, _.drop(arguments, 2));
    };
    // and finally return wrapped template
    return prepared;
  },

  /**
   * Adds global template import to the `data`
   * @param {?Object} [data={}]
   * @param {?boolean} [inherit=false]
   * @returns {Object}
   */
  imports: function(data, inherit) {
    data = $val(data, {}, _.isPlainObject);
    var imports = $private($fn.template, 'settings.imports')
      , args = [data, imports];
    if (! inherit) args.unshift({});
    return _.extend.apply(_, args);
  },

  /**
   * Returns template engine
   * @param {?string} [type]
   * @returns {Function}
   */
  getEngine: function() {
    var engine = $private($fn.template, 'engine');
    if (! _.isFunction(engine)) return $fn.template.getFallback();
    return engine;
  },

  /**
   * Sets template engine
   * @param {Function} engine
   * @return {Fiber.fn.template}
   */
  setEngine: function(engine) {
    if (! _.isFunction(engine)) return $fn.template;
    $private($fn.template, 'engine', engine);
    return $fn.template;
  },

  /**
   * Checks if template engine is valid and not the fallback one
   * @returns {boolean}
   */
  hasEngine: function() {
    var engine = $fn.template.getEngine()
      , fallback = $private($fn.template, 'fallback');
    if (! _.isFunction(engine) || engine === fallback) return false;
    return true;
  },

  /**
   * Returns system template engine
   * @returns {Function}
   */
  getSystem: function() {
    return $private($fn.template, 'system');
  },

  /**
   * Sets system template engine
   * @param {Function} engine
   * @returns {Fiber.fn.template}
   */
  setSystem: function(engine) {
    if (_.isFunction(engine)) $private($fn.template, '__system', engine);
    return $fn.template;
  },

  /**
   * Determines if has system template engine
   * @returns {boolean}
   */
  hasSystem: function() {
    return _.isFunction($fn.template.getSystem());
  },

  /**
   * Returns fallback template engine.
   * @returns {Function}
   */
  getFallback: function() {
    return $private($fn.template, 'fallback');
  },

  /**
   * Sets fallback template engine
   * @param {Function} fallback
   * @returns {Fiber.fn.template}
   */
  setFallback: function(fallback) {
    if (_.isFunction(fallback)) $private($fn.template, 'fallback', fallback);
    return $fn.template;
  },

  /**
   * Determines if fallback exists and is valid function
   * @returns {boolean}
   */
  hasFallback: function() {
    return _.isFunction($fn.template.getFallback());
  },

  /**
   * Returns settings object or value by path
   * @param {?string} [path]
   * @returns {*}
   */
  getSettings: function(path) {
    return $private($fn.template, $fn.join(['settings', path], '.'));
  },

  /**
   * Sets setting by path
   * @param path
   * @param value
   * @returns {Fiber.fn.template}
   */
  setSettings: function(path, value) {
    if (_.isPlainObject(path)) {
      path = 'settings';
      value = path;
    }

    if (! path) return $fn.template;
    $private($fn.template, path, value);
    return $fn.template;
  },

  /**
   * Determines if given setting is set or if template has valid settings object
   * @param {string} path
   * @returns {boolean}
   */
  hasSettings: function(path) {
    return $privateHas($fn.template, path);
  },

  /**
   * Includes template settings to the given object
   * @param {Object} object
   * @param {?string} [method='merge']
   * @returns {*}
   */
  includeSettings: function(object, method) {
    return _[$val(method, 'merge')](object, $fn.template.getSettings());
  },
};

/**
 * Mix settings to the lodash template
 */
$fn.template.includeSettings(_.templateSettings);
