/**
 * Fiber Middleware
 * @class
 * @extends {Fiber.Model}
 */
Fiber.Middleware = Fiber.Model.extend({

  /**
   * Model defaults
   * @type {Object}
   */
  defaults: {
    alias: '',
    handler: _.noop
  },

  /**
   * Validation rules
   * @type {Object}
   */
  rules: {
    alias: {
      required: true,
      validators: [_.isString]
    },
    handler: {
      required: true,
      validators: [_.isFunction]
    }
  },

  /**
   * Pass route through middleware.
   * Should always return boolean (is route allowed to execute)
   * @param {Object.<Fiber.Route>} route
   * @returns {boolean}
   */
  passThrough: function(route) {
    var handler = this.get('handler');
    if (_.isFunction(handler) && handler(route)) return true;
    return false;
  }
});
