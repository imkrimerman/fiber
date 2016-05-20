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
    handler: null
  },

  /**
   * Validation rules
   * @type {Object}
   */
  rules: {
    alias: {
      required: true,
      validators: [$isStr]
    },
    handler: {
      required: true,
      validators: [$isFn]
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
    return ! ! ($isFn(handler) && handler(route));
  }
});
