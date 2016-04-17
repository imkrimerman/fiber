/**
 * Views Manager
 * @class
 * @extends {Fiber.Bag}
 */
Fiber.ViewsManager = Fiber.Bag.extend({

  /**
   * Constructs manager
   * @param {jQuery|string} $el
   * @param {Object} [viewMap]
   */
  constructor: function($el, viewMap) {
    this.handleElement($el);
    this.setHolder(this.getHolder(), val(viewMap, {}, _.isPlainObject));
    this.__shown = {};
  },

  /**
   * Shows view at the given selector
   * @param {string} selector
   * @param {Object.<Fiber.View>} [view]
   * @return {Fiber.ViewsManager}
   */
  show: function(selector, view) {
    if (arguments.length === 1) view = this.get(selector);
    else this.set(selector, view);
    return this.render(selector, view);
  },

  /**
   * Renders `view` to the found element by the `selector`
   * @param {string} selector
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.ViewsManager}
   */
  render: function(selector, view) {
    var $destination = this.$el.find(selector);

    if (! $destination.length) {
      Fiber.logs.system.errorThrow('Destination selector: ' + selector + ' cannot be found', this.$el, this);
    }

    this.__renderToDestination($destination, view)
    return this.setShown(selector, $destination, view);
  },

  /**
   * Refreshes view at the `selector`
   * @param {string} selector
   * @param {boolean} [hard=true]
   * @returns {Fiber.ViewsManager}
   */
  refresh: function(selector, hard) {
    var isShown = this.hasShown(selector);
    if (! isShown) return this.show(selector);

    if (val(hard, false, _.isBoolean) && isShown) {
      this.close(selector);
      return this.show(selector);
    }

    var shown = this.getShown(selector);
    this.__renderToDestination(shown.$destination, shown.view);
    return this;
  },

  /**
   * Closes view at the `selector`
   * @param {string} selector
   * @returns {Fiber.ViewsManager}
   */
  close: function(selector) {
    if (! this.hasShown(selector)) return this;
    this.forgetShown(selector);
    return this;
  },

  /**
   * Returns shown by the selector
   * @param {string} selector
   * @returns {Object}
   */
  getShown: function(selector) {
    return this.__shown[selector];
  },

  /**
   * Determines if view is shown at the selector
   * @param {string} selector
   * @returns {boolean}
   */
  hasShown: function(selector) {
    return _.isPlainObject(this.getShown(selector));
  },

  /**
   * Sets shown object
   * @param {string} selector
   * @param {jQuery} $destination
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.ViewsManager}
   */
  setShown: function(selector, $destination, view) {
    this.__shown[selector] = {$destination: $destination, view: view};
    return this;
  },

  /**
   * Forgets shown view by the selector
   * @param {string} selector
   * @param {boolean} [cleanUp=true]
   * @returns {Fiber.ViewsManager}
   */
  forgetShown: function(selector, cleanUp) {
    if (! this.hasShown(selector)) return this;

    cleanUp = val(cleanUp, true, _.isBoolean);
    var shown = this.getShown(selector);

    if (cleanUp) {
      shown.view.remove();
      shown.$destination.empty();
    }

    delete this.__shown[selector];
    return this;
  },

  /**
   * Handles root element of the manager
   * @param {jQuery|string} $el
   * @returns {*|jQuery|HTMLElement}
   */
  handleElement: function($el) {
    if (! ($el instanceof $) && ! _.isString($el))
      Fiber.logs.system.errorThrow('`$el` should be a valid jQuery element or selector.', $el, this);
    return this.$el = _.isString($el) ? $($el) : $el;
  },

  /**
   * Renders view to the destination element
   * @param {jQuery} $destination
   * @param {Object.<Fiber.View>} view
   * @returns {Fiber.ViewsManager}
   * @private
   */
  __renderToDestination: function($destination, view) {
    if (! (view instanceof Backbone.View)) {
      Fiber.logs.system.errorThrow('View is not valid instance of Backbone.View and ' +
                                   'cannot be rendered', view, $destination, this);
    }

    $destination.html(view.el);
    view.render();
    return this;
  },
});
