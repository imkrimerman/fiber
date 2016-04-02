/**
 * Log levels
 * @type {Array}
 */
var LogLevels = ['trace', 'debug', 'info', 'warn', 'error']

/**
 * Fiber Log
 * @class
 */
Fiber.Log = Fiber.fn.createClass({

  /**
   * Current log level
   * @type {string}
   */
  level: 'error',

  /**
   * Log available levels
   * @type {Array}
   */
  levels: LogLevels,

  /**
   * Writer function
   * @type {Function}
   */
  writer: console.log,

  /**
   * Initializes log
   * @param {?Object} [options={}]
   */
  initialize: function(options) {
    Fiber.fn.class.handleOptions(this, options);
    if (! options.level || ! _.includes(LogLevels, options.level)) return;
    this.level = options.level;
  },

  /**
   * Writes arguments using `writer` function by level
   * @param {string} level
   * @param {...args}
   * @return {Fiber.Log}
   */
  write: function(level) {
    if (this.isAllowedToWrite(level)) this.callWriter(arguments);
    return this;
  },

  /**
   * Calls writer function with the given arguments
   * @return {Fiber.Log}
   */
  callWriter: function() {
    this.writer.apply(this.writer, _.toArray(arguments));
    return this;
  },

  /**
   * Determines if we allow to write log
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedToWrite: function(level) {
    var index = this.levels.indexOf(level);
    if (index === -1) return false;
    var currentLevelIndex = this.levels.indexOf(this.level);
    if (index > currentLevelIndex) return false;
    return true;
  }
}, {
  levels: LogLevels
});

/**
 * Adds log level methods "debug", "info", "warn", "error"
 */
for (var i = 0; i < Fiber.Log.prototype.levels.length; i ++) {
  var level = Fiber.Log.prototype.levels[i];
  Fiber.Log.prototype[level] = function() {
    return this.write.apply(this, [level].concat(_.toArray(arguments)));
  };
}
