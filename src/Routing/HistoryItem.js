/**
 * Fiber History Model
 * @class
 * @extends {Fiber.Model}
 */
Fiber.HistoryItem = Fiber.Model.extend({

  /**
   * Model defaults
   * @var {Object}
   */
  defaults: {
    route: null,
    args: null
  },

  /**
   * Validation rules
   * @var {Object}
   */
  rules: {
    route: {
      required: true,
      validators: [function(val) {
        return val instanceof Fiber.Route;
      }]
    },
    args: {
      validators: [_.isObjectLike]
    }
  }

});
