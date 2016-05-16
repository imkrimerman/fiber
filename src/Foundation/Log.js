/**
 * Add Log levels constants.
 */
Fiber.Config.set('Log', {
  level: 'trace',
  levels: {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
  }
});

/**
 * Fiber Log.
 * @class
 * @extends {BaseClass}
 */
Fiber.Log = BaseClass.extend({

  /**
   * Current log level.
   * @type {string}
   * @private
   */
  level: Fiber.Config.get('Log.level'),

  /**
   * Available log levels.
   * @type {Array}
   */
  levels: Fiber.Config.get('Log.levels'),

  /**
   * Writer object.
   * @type {function(...)}
   * @private
   */
  writer: console.log,

  /**
   * String representing who is logging the messages.
   * @type {string}
   */
  as: '[Fiber.Log]',

  /**
   * Templates storage.
   * @type {Object}
   */
  templates: {
    timestamp: '{{ timestamp }}',
    as: '{{ as }}',
    level: '{{ level }}',
    delimiter: '>>',
    msg: '{{ msg }}'
  },

  /**
   * Properties keys that will be auto extended from the initialization object.
   * @type {Array|function(...)|string|boolean}
   */
  willExtend: ['level', 'levels', 'writer', 'as', 'templates'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['level', 'levels', 'writer', 'as', 'templates'],

  /**
   * Supported Console API Methods
   * @type {Object}
   * @private
   */
  _methods: {
    log: 'log',
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
    dir: 'dir',
    table: 'table',
    clear: 'clear',
    count: 'count',
    assert: 'assert',
    group: 'group',
    groupEnd: 'groupEnd',
    groupCollapsed: 'groupCollapsed',
    time: 'time',
    timeEnd: 'timeEnd',
    profile: 'profile',
    profileEnd: 'profileEnd'
  },

  /**
   * Constructs log.
   * @param {?Object} [options]
   */
  constructor: function(options) {
    this._timers = [];
    $fn.class.ensureOwn(this, this.ownProps);
    this._handleTemplatesExtend(options);
    $fn.class.extendFromOptions(this, options, this.willExtend);
    this.$superInit(arguments);
  },

  /**
   * Writes using `writer` function.
   * @param {string} level
   * @param {...args}
   * @return {Fiber.Log}
   */
  write: function(level) {
    level = $valIncludes(level, 'log', this._methods);
    if (! this.isAllowedLevel(level)) return this;
    return this.callWriter(level, _.drop(arguments));
  },

  /**
   * Calls writer function with the given level and arguments.
   * @param {string} method
   * @param {Array} arguments - will be passed to writer function
   * @return {Fiber.Log}
   */
  callWriter: function(method, args) {
    method = $valIncludes(method, 'log', this._methods);
    var msg = _.first(args), details = this.renderTemplate({ msg: _.isString(msg) ? msg : '' });
    $fn.applyFn(method, $fn.argsConcat(details, $val(args, [], _.isArray)));
    return this;
  },

  /**
   * Renders template with `data`.
   * @param {Object} [data={}]
   * @returns {string}
   */
  renderTemplate: function(data) {
    return $fn.template.system(this.getTemplate(), this.getTemplateData(data));
  },

  /**
   * Returns joined template.
   * @param {string} [glue]
   * @returns {string}
   */
  getTemplate: function(glue) {
    return $fn.compact(_.map($fn.result(this.templates), function(part) {
      if (_.isString(part) || _.isFunction(part)) return part;
    })).join(glue || ' ');
  },

  /**
   * Returns template data.
   * @param {?Object} [data={}]
   * @returns {Object}
   */
  getTemplateData: function(data) {
    var date = new Date();
    return _.extend({
      self: this,
      level: this.level,
      as: this.as,
      timestamp: date.toTimeString().slice(0, 8) + '.' + date.getMilliseconds()
    }, $val(data, {}, _.isPlainObject));
  },

  /**
   * Logs `message` with a given `level` and `args` and returns `returnValue`.
   * @param {string} level
   * @param {string} message
   * @param {Array|Arguments|*} args
   * @param {*} returnVal
   * @param {boolean} [tryToCall=true]
   * @returns {*}
   */
  returns: function(level, message, args, returnVal, tryToCall) {
    this.callWriter(level, [message, args]);
    return $val(tryToCall, true) ? $fn.result(returnVal) : returnVal;
  },

  /**
   * Starts/Stops timer by `name`.
   * @param {string} name
   * @returns {Fiber.Log}
   */
  timer: function(name) {
    var index = this._timers.indexOf(name), method = ~ index ? 'timeEnd' : 'time';
    if (! (~ index)) this._timers.push(name);
    else this._timers.splice(index, 1);
    return this.callWriter(method, [name]);
  },

  /**
   * Determines if it's allowed to write with the given `level`.
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedLevel: function(level) {
    if (! level || ! _.includes(this.levels, level)) return false;
    var levels = _.values(this.levels)
      , index = levels.indexOf(level);
    if (index === - 1) return false;
    var currentLevelIndex = levels.indexOf(this.level);
    if (index >= currentLevelIndex) return true;
    return false;
  },

  /**
   * Handles templates extend from options.
   * @param {Object} options
   * @returns {Fiber.Log}
   * @private
   */
  _handleTemplatesExtend: function(options) {
    if (! options || ! options.templates) return this;
    _.extend(this.templates, options.templates);
    delete options.templates;
    return this;
  }
});

/**
 * Add level methods to the Log prototype.
 */
$each(_.keys(Fiber.Config.get('Log.levels')), function(level) {
  Fiber.Log.prototype[level] = function() {
    return this.write.apply(this, $fn.argsConcat(level, arguments));
  };
});

/**
 * Create default Logger
 * @type {Object.<Fiber.Log>}
 */
var $log = Fiber.log = new Fiber.Log();
