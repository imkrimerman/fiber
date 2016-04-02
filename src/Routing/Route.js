/**
 * Route
 * @class
 * @extends {Fiber.Model}
 */
Fiber.Route = Fiber.Model.extend({

  /**
   * Hidden fields list
   * @type {Array}
   */
  hidden: ['handler'],

  /**
   * Route defaults
   * @type {Object}
   */
  defaults: {
    url: '',
    alias: '',
    redirect: '',
    handler: null,
    compose: {} // View, Model, Collection
  },

  /**
   * Validation rules
   * @type {Object}
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
   * @type {Fiber.View}
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
   * @param {?boolean} [setAsHandler=true]
   * @returns {*|Fiber.View}
   */
  compose: function(setAsHandler) {
    var options = this.get('compose')
      , composer = this.composeView.bind(this)
      , handler = function() {
      return composer(options);
    };

    if (val(setAsHandler, true, _.isBoolean)) {
      this.set('handler', handler, {silent: true});
      this.setComposedState(true);
    }
    else return handler();
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
