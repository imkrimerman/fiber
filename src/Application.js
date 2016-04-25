/**
 * Fiber Application Class
 * @class
 */
Fiber.Application = $fn.class.createWithExtensions({

  /**
   * Viewport instance
   * @type {Object.<Fiber.Viewport>}
   */
  viewport: null,

  /**
   * Router instance
   * @type {Object.<Fiber.Router>}
   */
  router: null,

  /**
   * Fiber Inversion of Control Container instance
   * @type {Object.<Fiber.Services.Container>}
   */
  container: Fiber.container,

  /**
   * Default options holder
   * Will be used to retrieve options for instance construct
   * @type {Object}
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
    $fn.extensions.init(this, options);
    this.bootstrap(options);
    this.bindEvents();
    $fn.apply(this, 'initialize', arguments);
  },

  /**
   * Binds events
   */
  bindEvents: function() {
    this.listenTo(this.router, 'execute', this.whenRouteExecute.bind(this));
  },

  /**
   * When router executes hook
   * @param {Object.<Fiber.View>} composed
   * @param {Object.<Fiber.Route>} route
   * @param {Array} args
   */
  whenRouteExecute: function(composed, route) {
    this.viewport.show(composed, route.get('layout'));
  },

  /**
   * Bootstraps Application
   * @param {?Object} [options={}]
   * @returns {Fiber.Application}
   */
  bootstrap: function(options) {
    this.viewport = new Fiber.Viewport(options.viewport);
    this.router = new Fiber.Router(options.router);
    return this;
  },

  /**
   * Runs the Application
   * @return {Fiber.Application}
   */
  start: function() {
    $fn.fireCallCyclic(this, 'start', function() {
      Fiber.history.start();
      this.fire('start', this);
    });
    return this;
  },

  /**
   * Terminates Application
   * @returns {Fiber.Application}
   */
  stop: function() {
    $fn.fireCallCyclic(this, 'stop', function() {
      Fiber.history.stop();
      this.fire('stop', this);
    });
    return this;
  },

  /**
   * Handles income options
   * @param {?Object} [options={}]
   * @returns {Object}
   */
  handleOptions: function(options) {
    return $fn.class.handleOptions(this, options, this.result('defaults'), true);
  },

});
