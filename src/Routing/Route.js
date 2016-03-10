/**
 * Route
 * @class
 * @extends {Fiber.Model}
 */
Fiber.Route = Fiber.Model.extend({

  /**
   * Hidden fields list
   * @var {Array}
   */
  hidden: ['handler'],

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
      View: null,
      Model: null,
      Collection: null
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
   * Default route View Class
   * @var {Fiber.View}
   */
  ViewClass: Fiber.View,

  /**
   * Initializes route
   */
  initialize: function() {
    this.setComposedState(false);
    if (this.shouldCompose()) this.compose();
  },

  /**
   * Determines if route's page should compose
   * @returns {boolean}
   */
  shouldCompose: function() {
    return ! _.isEmpty(this.get('compose'));
  },

  /**
   * Determines if route is composed
   * @returns {boolean}
   */
  isComposed: function() {
    return this.getComposedState();
  },

  /**
   * Composes route page
   * @returns {Fiber.View}
   */
  compose: function() {
    var options = this.get('compose')
      , composed = this.composeView(options);

    this.set('handler', this.wrapComposedView(composed), {silent: true});
    this.setComposedState(true);
    return composed;
  },

  /**
   * Wraps composed View with function that returns new View
   * @param {Fiber.View} View
   * @returns {Function}
   */
  wrapComposedView: function(View) {
    return function(routeArgs) {
      return new View({routeArgs: routeArgs});
    };
  },

  /**
   * Composes View Class by the given options
   * @param {Object} options
   * @returns {Fiber.View}
   */
  composeView: function(options) {
    var View = options.View || this.ViewClass
    return Fiber.fn.class.composeView(View, options);
  },

  /**
   * Sets composed state
   * @param {boolean} state
   * @returns {Fiber.Route}
   */
  setComposedState: function(state) {
    this.__isComposed = state;
    return this;
  },

  /**
   * Returns composed state
   * @returns {boolean}
   */
  getComposedState: function() {
    return this.__isComposed;
  }
});
