/**
 * Fiber Application Class
 * @class
 */
Fiber.Application = Fiber.fn.class.createFullMixinClass({

  /**
   * Viewport instance
   * @var {Object.<Fiber.Viewport>}
   */
  viewport: null,

  /**
   * Router instance
   * @var {Object.<Fiber.Router>}
   */
  router: null,

  /**
   * Fiber Inversion of Control Container instance
   * @var {Object.<Fiber.Services.Container>}
   */
  container: null,

  /**
   * Default options holder
   * Will be used to retrieve options for instance construct
   * @var {Object}
   */
  defaults: {
    viewport: {},
    router: {}
  },

  /**
   * Constructs Application
   * @param {?Object} [options={}]
   */
  constructor: function(options) {
    options = this.handleOptions(options);
    this.bootstrap(options);
    Fiber.fn.apply(this, 'initialize', arguments);
  },

  /**
   * Bootstraps Application
   * @param {?Object} [options={}]
   * @returns {Fiber.Application}
   */
  bootstrap: function(options) {
    this.viewport = new Fiber.Viewport(options.viewport);
    this.router = new Fiber.Router(options.router);
    this.container = Fiber.Container;
    return this;
  },

  /**
   * Handles income options
   * @param {?Object} [options={}]
   * @returns {Object}
   */
  handleOptions: function(options) {
    return Fiber.fn.class.handleOptions(this, options, this.result('defaults'), true);
  },

});
