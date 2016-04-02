/**
 * Fiber Logger
 * @class
 */
Fiber.Log = Fiber.fn.class.create({

  //Add ability to enable/disable throwing exception on log
  exceptions: {},

  /**
   * Writer function
   * @type {Function}
   */
  writer: console.log,

  /**
   * Returns current log level
   * @type {string|null}
   */
  get level () {
    return this.__level || null;
  },

  /**
   * Sets log level
   * @param {string} level
   */
  set level (level) {
    level = val(level, Fiber.Globals.log.default);
    if (level && _.includes(Fiber.Globals.log.levels, level))
      this.__level = level;
  },

  /**
   * Initializes log
   * @param {?Object} [options={}]
   */
  initialize: function(options) {
    options = Fiber.fn.class.handleOptions(this, options);
    this.level = (options.level || Fiber.Globals.log.default);
  },

  /**
   * Writes arguments using `writer` function
   * @param {string} level
   * @param {...args}
   * @return {Fiber.Log}
   */
  write: function(level) {
    var args = _.drop(_.toArray(arguments));
    if (this.isAllowedToWrite(level)) this.callWriter(args);
    return this;
  },

  /**
   * Calls writer function with the given arguments
   * @param {...args}
   * @return {*}
   */
  callWriter: function(args) {
    args = val(args, [], _.isArray).concat([this.level, this]);
    return Fiber.fn.fireCallCyclic(this, 'write', this.writer, {
      fire: args, call: args
    });
  },

  /**
   * Writes arguments using `writer` function and
   * immediately throws Error with the same arguments
   * @param {...args}
   */
  errorThrow: function() {
    this.callWriter(arguments);
    throw Fiber.fn.class.makeInstanceWithArgs(Error, arguments);
  },

  /**
   * Writes arguments using `writer` function and returns false
   * @param {...args}
   * @return {boolean}
   */
  errorReturn: function() {
    this.callWriter(arguments);
    return false;
  },

  /**
   * Determines if we allow to write log
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedToWrite: function(level) {
    if (! level) return false;
    var index = this.levels.indexOf(level);
    if (index === - 1) return false;
    var currentLevelIndex = this.levels.indexOf(this.level);
    if (index > currentLevelIndex) return false;
    return true;
  }
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
