/**
 * Fiber Logger
 * @class
 * @extends {Fiber.Class}
 */
Fiber.Log = $fn.class.create({

  /**
   * Log timestamp
   * @type {boolean}
   */
  __timestamp: false,

  /**
   * Available log levels
   * @type {Array}
   */
  __levels: ['trace', 'debug', 'info', 'warn', 'error'].reverse(),

  /**
   * Current log level
   * @type {string}
   * @private
   */
  __level: 'error',

  /**
   * Writer object
   * @type {Object}
   * @private
   */
  __writer: console,

  /**
   * Method to use from `__writer`
   * @type {string|Function}
   * @private
   */
  __method: 'log',

  /**
   * Templates
   * @type {Object}
   */
  __templates: {
    timestamp: '{{ timestamp }}',
    intro: '[Fiber] >> `{{ self.getLevel() }}`:'
  },

  /**
   * Console API Profiling map
   * @type {Object}
   * @private
   */
  __profiling: {
    timer: ['time', 'timeEnd'],
    profile: ['profile', 'profileEnd'],
    group: ['group', 'groupEnd', 'groupCollapsed'],
    trace: 'trace'
  },

  /**
   * Console API Methods map
   * @type {Object}
   */
  __list: {
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
   * Fallback log function
   * @type {Function}
   */
  __fallback: console.log,

  /**
   * Constructs log
   * @param {?Object} [options]
   */
  constructor: function(options) {
    options = $fn.class.handleOptions(this, options, {
      level: this.__level,
      writer: this.__writer
    });

    this.setLevel(options.level);
    this.setWriter(options.writer);
  },

  /**
   * Writes arguments using `writer` function
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
   * Logs arguments using current level
   * @returns {Fiber.Log}
   */
  log: function() {
    return this.write.apply(this, [this.getLevel()].concat(_.toArray(arguments)));
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
   * @param {Function} testTrigger
   * @param {?Object} [options]
   * @returns {boolean}
   */
  time: function(name, testTrigger, options) {
    if (! _.isFunction(testTrigger)) return false;
    options = _.defaults(options || {}, {scope: null, args: []});
    this.startTimer(name);
    var result = testTrigger.apply(options.scope, options.args);
    this.stopTimer(name);
    if (! _.isEmpty(result)) this.write(this.__level, result);
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
    this.__callWriter(this.__list.dir, arguments);
    return this;
  },

  /**
   * Logs any supplied data using a tabular layout.
   * @param {Object|Array|*} data
   * @param {?Array} [columns]
   * @returns {Fiber.Log}
   */
  table: function(data, columns) {
    this.__callWriter(this.__list.table, arguments);
    return this;
  },

  /**
   * Clears console
   * @returns {Fiber.Log}
   */
  clear: function() {
    this.__callWriter(this.__list.clear, arguments);
    return this;
  },

  /**
   * Logs the provided string along with the number of times the same string has been provided.
   * @returns {Fiber.Log}
   */
  count: function() {
    this.__callWriter(this.__list.count, arguments);
    return this;
  },

  /**
   * Conditionally displays an error string (its second parameter)
   * only if its first parameter evaluates to false.
   * @returns {Fiber.Log}
   */
  assert: function() {
    this.__callWriter(this.__list.assert, arguments);
    return this;
  },

  /**
   * Returns current log level
   * @type {string|null}
   */
  getLevel: function() {
    return this.__level || null;
  },

  /**
   * Sets log level
   * @param {string} level
   * @return {Fiber.Log}
   */
  setLevel: function(level) {
    level = $val(level, this.__level);
    if (level && _.includes(this.__levels, level)) this.__level = level;
    return this;
  },

  /**
   * Sets writer method to use by default for all log __levels
   * @param {string} method
   * @returns {Fiber.Log}
   */
  setWriterMethod: function(method) {
    this.__method = method;
    return this;
  },

  /**
   * Returns used writer method
   * @returns {string|Function}
   */
  getWriterMethod: function() {
    return this.__method;
  },

  /**
   * Sets log writer function
   * @param {Object} writer
   * @returns {Fiber.Log}
   */
  setWriter: function(writer) {
    this.__writer = $val(writer, this.__writer, _.isObject);
    return this;
  },

  /**
   * Returns writer function
   * @returns {Object}
   */
  getWriter: function() {
    return this.__writer;
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
   * @param {...args}
   * @return {Fiber.Log}
   */
  callWriter: function(level, args) {
    var details = this.renderDetails()
      , method = _.includes(this.__list, level) ? this.__list[level] : this.__method;
    args = [details].concat($val(args, [], _.isArray));
    this.__callWriter(method, args);
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

    var method = this.__profiling[key];
    if (_.isString(method)) this.__callWriter(method, args);
    else if (_.isArray(method) && _.isNumber(index) && index < method.length) this.__callWriter(method[index], args);
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
   * Renders details info
   * @param {?Object} [data={}]
   * @param {?string} [delimiter=' ']
   * @returns {string}
   */
  renderDetails: function(data, delimiter) {
    var html = [];
    data = this.getTemplateData(data);
    _.each(this.__templates, function(template, key) {
      if (key === 'timestamp' && ! this.timestamp) return;
      html.push(this.renderTemplate(template, data));
    }, this);
    return html.join($val(delimiter, ' ', _.isString));
  },

  /**
   * Renders template with the given data
   * @param {string} template
   * @param {?Object} [data]
   * @returns {Function}
   */
  renderTemplate: function(template, data) {
    return _.template(template)(data);
  },

  /**
   * Returns template data to render details
   * @param {?Object} [data={}]
   * @returns {Object}
   */
  getTemplateData: function(data) {
    var date = new Date();
    return _.extend({}, {
      timestamp: date.toTimeString().slice(0, 8),
      self: this,
      msg: ''
    }, $val(data, {}, _.isPlainObject));
  },

  /**
   * Determines if we allow to write log
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedToWrite: function(level) {
    if (! level || ! _.includes(this.__levels, level) || ! this.hasWriter()) return false;
    var index = this.__levels.indexOf(level);
    if (index === - 1) return false;
    var currentLevelIndex = this.__levels.indexOf(this.getLevel());
    if (index > currentLevelIndex) return false;
    return true;
  },

  /**
   * Calls raw writer
   * @param {string|Function} method
   * @param {?Array} [args]
   * @returns {*}
   * @private
   */
  __callWriter: function(method, args) {
    if (_.isString(method)) method = $fn.class.resolveMethod(this.__writer, method);
    if (! _.isFunction(method) && _.isFunction(this.__fallback)) method = this.__fallback;
    if (_.isFunction(method)) return method.apply(this.__writer, method, args);
  },
});

/**
 * Adds log level methods `trace`, `debug`, `info`, `warn`, `error` to the Log Class prototype
 */
$each(Fiber.Log.prototype.__levels, function(level) {
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
