/**
 * Fiber Logger
 * @class
 * @extends {BaseClass}
 */
Fiber.Log = BaseClass.extend({

  /**
   * Available log levels
   * @type {Array}
   */
  _levels: ['trace', 'debug', 'info', 'warn', 'error'].reverse(),

  /**
   * Current log level
   * @type {string}
   * @private
   */
  _level: 'error',

  /**
   * Writer object
   * @type {Object}
   * @private
   */
  _writer: console,

  /**
   * Method to use from `_writer`
   * @type {string|function()}
   * @private
   */
  _method: 'log',

  /**
   * Fallback log function
   * @type {function()}
   */
  _fallback: console.log,

  /**
   * Log timestamp
   * @type {boolean}
   */
  _timestamp: true,

  /**
   * Log current log level
   * @type {boolean}
   */
  _templateLevel: true,

  /**
   * Log template
   * @type {Object}
   */
  _template: '{{= before }}{{= level }} >>',

  /**
   * Template prefix string
   * @type {string|function()}
   */
  _templatePrefix: '[Fiber.Log]',

  /**
   * Console API Methods map
   * @type {Object}
   */
  _methods: {
    log: 'log',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
    dir: 'dir',
    table: 'table',
    clear: 'clear',
    count: 'count',
    assert: 'assert'
  },

  /**
   * Console API Profiling map
   * @type {Object}
   * @private
   */
  _profiling: {
    timer: ['time', 'timeEnd'],
    profile: ['profile', 'profileEnd'],
    group: ['group', 'groupEnd', 'groupCollapsed'],
    trace: 'trace'
  },

  /**
   * Constructs log
   * @param {?Object} [options]
   */
  constructor: function(options) {
    options = $fn.class.handleOptions(this, options, {
      level: this._level,
      writer: this._writer,
      timestamp: this._timestamp,
      template: this._template,
      templateLevel: this._templateLevel,
      templatePrefix: this._templatePrefix
    });

    this._timestamp = options.timestamp;
    this._template = options.template;
    this._templateLevel = options.templateLevel;
    this._templatePrefix = options.templatePrefix;
    this.setLevel(options.level);
    this.setWriter(options.writer);
  },

  /**
   * Writes using `writer` function
   * @param {string} level
   * @param {...args}
   * @return {Fiber.Log}
   */
  write: function(level) {
    var args = _.drop(_.toArray(arguments));
    if (this.isAllowedToWrite(level)) this.callWriter(level, args);
    return this;
  },

  /**
   * Starts time profiling
   * @returns {Fiber.Log}
   */
  startTimer: function() {
    return this.callProfile('timer', 0, arguments);
  },

  /**
   * Stops time profiling
   * @returns {Fiber.Log}
   */
  stopTimer: function() {
    return this.callProfile('timer', 1, arguments);
  },

  /**
   * Starts performance measurement
   * @param {function()} testTrigger
   * @param {?Object} [options]
   * @returns {boolean}
   */
  time: function(name, testTrigger, options) {
    if (! _.isFunction(testTrigger)) return false;
    options = _.defaults(options || {}, {scope: null, args: []});
    this.startTimer(name);
    var result = testTrigger.apply(options.scope, options.args);
    this.stopTimer(name);
    if (! _.isEmpty(result)) this.write(this._level, result);
    return true;
  },

  /**
   * Starts browser profiling
   * @returns {Fiber.Log}
   */
  startProfile: function() {
    return this.callProfile('profile', 0, arguments);
  },

  /**
   * Stops browser profiling
   * @returns {Fiber.Log}
   */
  stopProfile: function() {
    return this.callProfile('profile', 1, arguments);
  },

  /**
   * Adds log group
   * @returns {Fiber.Log}
   */
  group: function() {
    this.callProfile('group', 0, arguments);
    return this;
  },

  /**
   * Removes log group
   * @returns {Fiber.Log}
   */
  ungroup: function() {
    this.callProfile('group', 1, arguments);
    return this;
  },

  /**
   * Creates collapsed group
   * @returns {Fiber.Log}
   */
  groupCollapse: function() {
    this.callProfile('groupCollapse', 2, arguments);
    return this;
  },

  /**
   * Shows stack trace
   * @returns {Fiber.Log}
   */
  showTrace: function() {
    this.callProfile('trace', null, arguments);
    return this;
  },

  /**
   * Lists out all of the properties of a provided object as an expandable JavaScript object
   * @returns {Fiber.Log}
   */
  dir: function() {
    this._callWriter(this._methods.dir, arguments);
    return this;
  },

  /**
   * Logs any supplied data using a tabular layout.
   * @param {Object|Array|*} data
   * @param {?Array} [columns]
   * @returns {Fiber.Log}
   */
  table: function(data, columns) {
    this._callWriter(this._methods.table, arguments);
    return this;
  },

  /**
   * Clears console
   * @returns {Fiber.Log}
   */
  clear: function() {
    this._callWriter(this._methods.clear, arguments);
    return this;
  },

  /**
   * Logs the provided string along with the number of times the same string has been provided.
   * @returns {Fiber.Log}
   */
  count: function() {
    this._callWriter(this._methods.count, arguments);
    return this;
  },

  /**
   * Conditionally displays an error string (its second parameter)
   * only if its first parameter evaluates to false.
   * @returns {Fiber.Log}
   */
  assert: function() {
    this._callWriter(this._methods.assert, arguments);
    return this;
  },

  /**
   * Returns current log level
   * @type {string|null}
   */
  getLevel: function() {
    return this._level || null;
  },

  /**
   * Sets log level
   * @param {string} level
   * @return {Fiber.Log}
   */
  setLevel: function(level) {
    level = $val(level, this._level);
    if (level && _.includes(this._levels, level)) this._level = level;
    return this;
  },

  /**
   * Sets writer method to use by default for all log _levels
   * @param {string} method
   * @returns {Fiber.Log}
   */
  setWriterMethod: function(method) {
    this._method = method;
    return this;
  },

  /**
   * Returns used writer method
   * @returns {string|function()}
   */
  getWriterMethod: function() {
    return this._method;
  },

  /**
   * Sets log writer function
   * @param {Object} writer
   * @returns {Fiber.Log}
   */
  setWriter: function(writer) {
    this._writer = $val(writer, this._writer, _.isObject);
    return this;
  },

  /**
   * Returns writer function
   * @returns {Object}
   */
  getWriter: function() {
    return this._writer;
  },

  /**
   * Determine if log has valid writer
   * @returns {boolean}
   */
  hasWriter: function() {
    return _.isObject(this.getWriter());
  },

  /**
   * Calls writer function with the given arguments
   * @param {string} level
   * @param {Array} arguments - to path to writer function
   * @return {Fiber.Log}
   */
  callWriter: function(level, args) {
    var details = this.renderDetails()
      , method = _.includes(this._methods, level) ? this._methods[level] : this._method;
    args = [details].concat($val(args, [], _.isArray));
    this._callWriter(method, args);
    return this;
  },

  /**
   * Calls profiler functions
   * @param {string} key
   * @param {number|null} index
   * @param {?Array|Arguments} args
   * @returns {Fiber.Log}
   */
  callProfile: function(key, index, args) {
    if (! _.isNumber(index) && arguments.length === 2) {
      args = index;
      index = null;
    }

    var method = this._profiling[key];
    if (_.isString(method)) this._callWriter(method, args);
    else if (_.isArray(method) && _.isNumber(index) && index < method.length) this._callWriter(method[index], args);
    return this;
  },

  /**
   * Writes arguments using `writer` function and
   * immediately throws Error with the same arguments
   * @param {...args}
   */
  errorThrow: function() {
    this.callWriter(this.getLevel(), arguments);
    throw new Error(arguments[0]);
  },

  /**
   * Writes arguments using `writer` function and returns false
   * @param {...args}
   * @return {boolean}
   */
  errorReturn: function() {
    this.callWriter(this.getLevel(), arguments);
    return false;
  },

  /**
   * Enables timestamp logging
   * @returns {Fiber.Log}
   */
  enableTimestamp: function() {
    return this.setTimestampState(true);
  },

  /**
   * Disables timestamp logging
   * @returns {Fiber.Log}
   */
  disableTimestamp: function() {
    return this.setTimestampState(false);
  },

  /**
   * Sets timestamp logging state
   * @param {boolean} state
   * @returns {Fiber.Log}
   */
  setTimestampState: function(state) {
    this.timestamp = $val(state, true, _.isBoolean);
    return this;
  },

  /**
   * Determines if we allow to write log
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedToWrite: function(level) {
    if (! level || ! _.includes(this._levels, level) || ! this.hasWriter()) return false;
    var index = this._levels.indexOf(level);
    if (index === - 1) return false;
    var currentLevelIndex = this._levels.indexOf(this.getLevel());
    if (index > currentLevelIndex) return false;
    return true;
  },

  /**
   * Renders details info
   * @param {?Object} [data={}]
   * @returns {string}
   */
  renderDetails: function(data) {
    if (! this._template) return '';
    return $fn.template.system($fn.result(this._template), this.getTemplateData(data));
  },

  /**
   * Returns template data to render details
   * @param {?Object} [data={}]
   * @returns {Object}
   */
  getTemplateData: function(data) {
    var date = new Date();
    return _.extend({
      self: this,
      level: this._templateLevel ? '- `' + this.getLevel() + '`' : '',
      before: [
        $fn.result(this, '_templatePrefix'),
        this._timestamp ? 'at ' + date.toTimeString().slice(0, 8) + '.' + date.getMilliseconds() : ''
      ].join(' '),
    }, $val(data, {}, _.isPlainObject));
  },

  /**
   * Calls raw writer
   * @param {string|function()} method
   * @param {?Array} [args]
   * @returns {*}
   * @private
   */
  _callWriter: function(method, args) {
    if (_.isString(method)) method = $fn.class.resolveMethod(this._writer, method);
    if (! _.isFunction(method) && _.isFunction(this._fallback)) method = this._fallback;
    if (_.isFunction(method)) return method.apply(this._writer, args);
  },
});

/**
 * Adds log level methods `trace`, `debug`, `info`, `warn`, `error` to the Log Class prototype
 */
$each(Fiber.Log.prototype._levels, function(level) {
  Fiber.Log.prototype[level] = function() {
    var args = [level].concat(_.toArray(arguments));
    return this.write.apply(this, args);
  };
});

/**
 * Add system logger
 * @type {Object.<Fiber.Log>}
 */
Fiber.log = $Log = new Fiber.Log();
