/**
 * Add Log levels constants
 */
Fiber.Constants.set('Log', {
  level: 'error',
  levels: {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
  }
});

/**
 * Fiber Logger
 * @class
 * @extends {BaseClass}
 */
Fiber.Log = BaseClass.extend({

  /**
   * Current log level
   * @type {string}
   * @private
   */
  level: Fiber.Constants.get('Log.level'),

  /**
   * Available log levels
   * @type {Array}
   */
  levels: Fiber.Constants.get('Log.levels'),

  /**
   * Writer object
   * @type {function()}
   * @private
   */
  writer: console.log,

  /**
   * Fallback log function
   * @type {function()}
   */
  fallback: console.log,

  /**
   * String representing who is logging the messages
   * @type {string|function()|Function}
   */
  logs: '[Fiber.Log]',

  /**
   * Templates storage
   * @type {Object}
   */
  templates: {
    timestamp: '{{ timestamp }}',
    logs: '{{ logs }}',
    level: '{{ level }}',
    delimiter: '>>',
    msg: '{{ msg }}'
  },

  /**
   * Properties keys that will be auto extended from the initialization object
   * @type {Array|function()|string|boolean}
   */
  willExtend: ['level', 'levels', 'writer', 'fallback', 'templates'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function()}
   */
  ownProps: ['level', 'levels', 'writer', 'fallback', 'templates'],

  /**
   * Supported Console API Methods
   * @type {Object}
   * @private
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
    assert: 'assert',
  },

  /**
   * Supported Console API Profiling Methods
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
    $fn.class.extendFromOptions(this, options);
    this.$superInit(arguments);
  },

  /**
   * Writes using `writer` function
   * @param {string} level
   * @param {...args}
   * @return {Fiber.Log}
   */
  write: function(level) {
    return this._callWriter(level, _.drop(arguments));
  },

  /**
   * Calls writer function with the given level and arguments.
   * @param {string} level
   * @param {Array} arguments - will be passed to writer function
   * @return {Fiber.Log}
   */
  _callWriter: function(level, args) {
    if (! this.isAllowedToWrite(level)) return this;
    var details = this.renderDetails()
      , method = _.includes(this._methods, level) ? this._methods[level] : this._method;
    args = [details].concat($val(args, [], _.isArray));
    if (! _.isFunction(method) && _.isFunction(this.fallback)) method = this.fallback;
    $fn.applyFn(method, args);
    return this;
  },

  /**
   * Calls profiler functions
   * @param {string} key
   * @param {number|null} index
   * @param {?Array|Arguments} args
   * @returns {Fiber.Log}
   */
  _callProfile: function(key, index, args) {
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
   * Logs message with a given level and args and returns given value
   * @param {string} level
   * @param {string} msg
   * @param {Array|Arguments|*} args
   * @param {*} returnVal
   * @param {boolean} [tryToCall=true]
   * @returns {*}
   */
  logReturn: function(level, msg, args, returnVal, tryToCall) {
    this._callWriter(level, [msg, args]);
    return $val(tryToCall, true) ? $fn.result(returnVal) : returnVal;
  },

  /**
   * Writes arguments using `writer` function and
   * immediately throws Error with the same arguments
   * @param {...args}
   */
  errorThrow: function(msg) {
    return this.logReturn('error', msg, _.drop(arguments), function() {
      throw new Error(msg);
    });
  },

  /**
   * Writes arguments using `writer` function and returns false
   * @param {...args}
   * @return {boolean}
   */
  errorReturn: function(msg) {
    return this.logReturn('error', msg, _.drop(arguments), false);
  },

  /**
   * Renders details info
   * @param {Object} [data={}]
   * @returns {string}
   */
  renderDetails: function(data) {
    return $fn.template.system(this.getTemplate(), this.getTemplateData(data));
  },

  /**
   * Returns joined template
   * @param {string} [glue]
   * @returns {string}
   */
  getTemplate: function(glue) {
    return $fn.compact(_.map($fn.result(this.templates), function(part) {
      if (_.isString(part) || _.isFunction(part)) return part;
    })).join(glue || ' ');
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
      timestamp: date.toTimeString().slice(0, 8) + '.' + date.getMilliseconds()
    }, $val(data, {}, _.isPlainObject));
  },

  /**
   * Determines if we allow to write log
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedToWrite: function(level) {
    if (! level || ! _.includes(this.levels, level) || ! this.hasWriter()) return false;
    var index = this.levels.indexOf(level);
    if (index === - 1) return false;
    var currentLevelIndex = this.levels.indexOf(this.level);
    if (index > currentLevelIndex) return false;
    return true;
  },

  /**
   * Starts time profiling
   * @returns {Fiber.Log}
   */
  startTimer: function() {
    return this._callProfile('timer', 0, arguments);
  },

  /**
   * Stops time profiling
   * @returns {Fiber.Log}
   */
  stopTimer: function() {
    return this._callProfile('timer', 1, arguments);
  },

  /**
   * Starts performance measurement
   * @param {function()} testTrigger
   * @param {?Object} [options]
   * @returns {boolean}
   */
  time: function(name, testTrigger, options) {
    if (! _.isFunction(testTrigger)) return false;
    options = _.defaults(options || {}, { scope: null, args: [] });
    this.startTimer(name);
    var result = testTrigger.apply(options.scope, options.args);
    this.stopTimer(name);
    if (! _.isEmpty(result)) this.write(this.level, result);
    return true;
  },

  /**
   * Starts browser profiling
   * @returns {Fiber.Log}
   */
  startProfile: function() {
    return this._callProfile('profile', 0, arguments);
  },

  /**
   * Stops browser profiling
   * @returns {Fiber.Log}
   */
  stopProfile: function() {
    return this._callProfile('profile', 1, arguments);
  },

  /**
   * Adds log group
   * @returns {Fiber.Log}
   */
  group: function() {
    this._callProfile('group', 0, arguments);
    return this;
  },

  /**
   * Removes log group
   * @returns {Fiber.Log}
   */
  ungroup: function() {
    this._callProfile('group', 1, arguments);
    return this;
  },

  /**
   * Creates collapsed group
   * @returns {Fiber.Log}
   */
  groupCollapse: function() {
    this._callProfile('groupCollapse', 2, arguments);
    return this;
  },

  /**
   * Shows stack trace
   * @returns {Fiber.Log}
   */
  showTrace: function() {
    this._callProfile('trace', null, arguments);
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
  }
});

/**
 * Adds level log methods to the Log prototype
 */
$each(_.keys(Fiber.Constants.get('Log.levels')), function(level) {
  Fiber.Log.prototype[level] = function() {
    return this.write.apply(this, $fn.argsConcat(level, arguments));
  };
});

/**
 * Create default Logger
 * @type {Object.<Fiber.Log>}
 */
Fiber.log = $log = new Fiber.Log();
