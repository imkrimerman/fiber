/**
 * Fiber Template support
 * @type {Object}
 */
Fiber.fn.template = {

  /**
   * System template settings
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

  /**
   * Available engines
   * @type {Object}
   * @private
   */
  _engines: {

    /**
     * Main template engine
     * @type {Function}
     */
    engine: _.template,

    /**
     * System template engine
     * @type {Function}
     */
    system: _.template,

    /**
     * Fallback template engine
     * @type {Function}
     */
    fallback: $fn.constant,
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
  prepare: function(template, engineName) {
    engineName = $val(engineName, 'engine', $fn.createIncludes($fn.template.getAliases()));
    var engine = $fn.template.getEngine(engineName);
    // if engine is not found then lets wrap to return the same
    if (! _.isFunction(engine)) $Log.errorThrow('Template engine is not a function');
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
    var imports = $fn.template.getSettings('imports')
      , args = [data, imports];
    if (! inherit) args.unshift({});
    return _.extend.apply(_, args);
  },

  /**
   * Returns template engine
   * @param {?string} [type='engine']
   * @returns {Function}
   */
  getEngine: function(alias) {
    var engine = $fn.get($fn.template._engines, alias || 'engine');
    if (_.isFunction(engine)) return engine;
    return $fn.template.getFallback();
  },

  /**
   * Sets template engine
   * @param {string} alias
   * @param {Function} engine
   * @return {Fiber.fn.template}
   */
  setEngine: function(alias, engine) {
    if (! _.isFunction(engine)) return $fn.template;
    return $fn.set($fn.template._engines, alias, engine);
  },

  /**
   * Checks if template engine is valid and not the fallback one
   * @param {?string} [alias='engine']
   * @returns {boolean}
   */
  hasEngine: function(alias) {
    return _.isFunction($fn.template.getEngine(alias))
  },

  /**
   * Removes engine by alias and returns it
   * @param {string} alias
   * @returns {Function}
   */
  forgetEngine: function(alias) {
    var engine = $fn.template.getEngine(alias);
    $fn.forget($fn.template._engines, alias);
    return engine;
  },

  /**
   * Returns fallback template engine.
   * @returns {Function}
   */
  getFallback: function() {
    return $fn.template._fallback;
  },

  /**
   * Sets fallback template engine
   * @param {Function} engine
   * @returns {Fiber.fn.template}
   */
  setFallback: function(engine) {
    if (_.isFunction(engine)) $fn.template.setEngine('fallback', engine);
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
    return $fn.get($fn.template, $fn.template.makeSettingsPath(path));
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
    return $fn.set($fn.template, $fn.template.makeSettingsPath(path), value);
  },

  /**
   * Determines if given setting is set or if template has valid settings object
   * @param {string} path
   * @returns {boolean}
   */
  hasSettings: function(path) {
    return $fn.has($fn.template, $fn.template.makeSettingsPath(path));
  },

  /**
   * Removes settings at the path
   * @param {string} path
   * @returns {boolean}
   */
  forgetSettings: function(path) {
    return $fn.get($fn.template, $fn.template.makeSettingsPath(path));
  },

  /**
   * Makes settings access key
   * @param {?string} [path]
   * @returns {string}
   */
  makeSettingsPath: function(path) {
    return $fn.join('settings', path, '.');
  },

  /**
   * Returns list of engines aliases
   * @returns {Array}
   */
  getAliases: function() {
    return _.keys($fn.template._engines);
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
