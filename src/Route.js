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
  hidden: ['handler', 'middleware'],

  /**
   * Class defaults
   * @type {Object}
   */
  defaults: {
    alias: null,
    url: null,
    page: null,
    handler: null,
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
      required: true,
      match: 'any',
      validators: [_.isFunction, [_.isString, _.negate(_.isEmpty)]]
    }
  },

  /**
   * Initialize
   * @param {Object} [attributes]
   * @param {Object} [options]
   */
  initialize: function(attributes, options) {
    this.ensureAlias();
  },

  /**
   * Checks if route is valid
   * @returns {boolean}
   */
  isValid: function() {
    return this.validate();
  },

  /**
   * Checks if page needs to be resolve
   * @param {Object.<Fiber.Page>} page
   * @return {boolean}
   */
  isPageNeedResolve: function(page) {
    return _.isString(page) && ! _.isEmpty(page);
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
});
