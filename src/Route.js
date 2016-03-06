/**
 * Fiber Route
 * @class
 * @extends {Fiber.Model}
 */
Fiber.Route = Fiber.Model.extend({

  /**
   * Class hidden fields
   * @type {Array.<String>}
   */
  hidden: ['middleware'],

  /**
   * Class defaults
   * @type {Object}
   */
  defaults: {
    alias: null,
    url: null,
    page: null,
    redirect: null,
    middleware: []
  },

  /**
   * Validation rules
   * @type {Object}
   */
  rules: {
    alias: {
      validators: [_.isString]
    },
    url: {
      required: true,
      validators: [_.isString, _.negate(_.isEmpty)]
    },
    page: {
      match: 'any',
      validators: [_.isFunction, [_.isString, _.negate(_.isEmpty)]]
    }
  },

  /**
   * Initialize
   * @param {Object} [attributes]
   * @param {Object} [options]
   */
  initialize: function() {
    this.ensureAlias();

    if (this.has('compose')) {
      this.set('page', this.createPage());
    }
  },

  /**
   * Checks if route is valid
   * @returns {boolean}
   */
  isValid: function() {
    return this.validate();
  },

  /**
   * Ensures that route has alias
   * @returns {Route}
   */
  ensureAlias: function() {
    if (! this.has('alias')) {
      var url = _.result(this, 'url') || _.uniqueId('route-');
      this.set('alias', url);
    }
    return this;
  },

  /**
   * Creates page instance
   * @param {Object} [options]
   * @returns {Object.<Fiber.Page>}
   */
  createPage: function(options) {
    options = options || this.get('compose');
    return new Fiber.Page(options);
  },
});
