/**
 * Route
 * @class
 * @extends {Fiber.Model}
 */
Fiber.Route = Fiber.Model.extend({

  /**
   * Route defaults
   * @var {Object}
   */
  defaults: {
    url: '',
    alias: '',
    redirect: '',
    handler: null,
    compose: {
      view: null,
      model: null,
      collection: null
    }
  },

  /**
   * Validation rules
   * @var {Object}
   */
  rules: {
    url: {
      required: true,
      validators: [_.isString]
    },
    compose: {
      validators: [_.isPlainObject],
      when: function(attributes) {
        return ! _.isFunction(attributes.handler);
      }
    },
    handler: {
      validators: [_.isFunction],
      when: function(attributes) {
        return ! _.isEmpty(attributes.compose);
      }
    }
  },

  /**
   * Determines if route's page should compose
   * @returns {boolean}
   */
  shouldCompose: function() {
    return ! _.isEmpty(this.get('compose'));
  },

  /**
   * Composes route page
   * @returns {Function}
   */
  compose: function() {
    var options = this.get('compose');
    return Fiber.fn.class.composeView(options.view || Fiber.View, options);
  },
});
