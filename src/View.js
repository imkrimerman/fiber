/**
 * Fiber View Class
 * @class
 * @extends {Backbone.View}
 */
Fiber.View = fn.class.make(Backbone.View, [
  'Extensions', 'Extend', 'OwnProps', 'Access', 'Binder', Fiber.Events, {

    /**
     * Parent element to auto attach
     * @type {jQuery}
     */
    $parent: null,

    /**
     * Linked views collection
     * @type {Object.<Fiber.LinkedView>}
     */
    linked: null,

    /**
     * View ui selectors
     * @type {Object}
     */
    ui: {},

    /**
     * View `$ui` found elements by `ui` selector
     * @type {Object}
     */
    $ui: {},

    /**
     * Instance key to listen to
     * @type {string}
     */
    listens: 'model',

    /**
     * Events listeners
     * @type {Object}
     */
    listeners: {
      change: 'render'
    },

    /**
     * Events that should be retransmitted
     * @type {Object}
     */
    transmit: {},

    /**
     * Views manager instance
     * @type {Object.<Fiber.ViewsManager>}
     */
    viewsManager: null,

    /**
     * Rendered flag
     * @type {boolean}
     */
    __rendered: false,

    /**
     * Properties keys that will be auto extended from initialize object
     * @type {Array|Function|string}
     */
    willExtend: [
      'model', 'collection', 'el', 'id', 'className', 'tagName', 'events',
      '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', 'transmit'
    ],

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|Function}
     */
    ownProps: [
      'model', 'collection', 'el', 'id', 'className', 'tagName', 'events', 'linked', '__rendered',
      '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', '$ui', 'transmit', 'viewsManager'
    ],

    /**
     * Constructs View
     * @param {?Object} [options={}]
     */
    constructor: function(options) {
      this.options = options;
      this.cid = _.uniqueId('view-');
      this.linked = new Fiber.LinkedViews();
      this.applyExtend(options);
      this.applyOwnProps();
      this.applyBinder();
      this.resolveListenable();
      this.startTransmitting();
      this.__handleEventsUi();
      this.__wrapRender();
      this._ensureElement();
      this.viewsManager = new Fiber.ViewsManager(this.$el);
      this.initialize.apply(this, arguments);
      this.$el.data('fiber.view', this);
    },

    /**
     * Render View
     * @returns {Fiber.View}
     */
    render: function() {
      if (this.has('template'))
        this.html(this.renderTemplate(this.get('template')));
      if (this.has('$parent'))
        this.attachToParent(this.result('$parent'));
      return this;
    },

    /**
     * Determine if view is rendered
     * @returns {boolean}
     */
    isRendered: function() {
      return this.__rendered;
    },

    /**
     * Attaches View to parent element
     * @param {string|$} $parent
     * @returns {Fiber.View}
     */
    attachToParent: function($parent) {
      if (_.isString($parent)) $parent = Fiber.$($parent);
      if ($parent instanceof Fiber.$) $parent.html(this.$el);
      return this;
    },

    /**
     * Sets view element html or returns it
     * @param {string} html
     * @returns {Fiber.View}
     */
    html: function(html) {
      this.$el.html(html);
      return this;
    },

    /**
     * Renders template
     * @param {string|Function} template
     * @param {?Object} [data={}]
     * @returns {string}
     */
    renderTemplate: function(template, data) {
      data = this.makeTemplateData(data);
      if (_.isString(template)) return fn.template.compile(template, data);
      if (_.isFunction(template)) template = template(data);
      return template;
    },

    /**
     * Makes data for template
     * @param {?Object} [additional={}]
     * @returns {Object}
     */
    makeTemplateData: function(additional) {
      var data = this.result('templateData', {});
      if (this.model) data = _.extend({}, data, this.model.toJSON());
      _.isPlainObject(additional) && (data = _.extend({}, data, additional));
      data.self = this;
      return data;
    },

    /**
     * Shows sub view at the given selector
     * @param {string} selector
     * @param {Object.<Fiber.View>} view
     * @returns {Fiber.View}
     */
    showView: function(selector, view) {
      this.viewsManager.show(selector, view);
      return this;
    },

    /**
     * Shuts down sub view and cleans up
     * @param {string} selector
     * @returns {Fiber.View}
     */
    closeView: function(selector) {
      this.viewsManager.close(selector);
      return this;
    },

    /**
     * Refreshes view at the given selector
     * @param {string} selector
     * @param {?boolean} [hard=false]
     * @returns {Fiber.View}
     */
    refreshView: function(selector, hard) {
      this.viewsManager.refresh(selector, hard);
      return this;
    },

    /**
     * Resolves ui elements
     * @returns {Object}
     */
    resolveUi: function() {
      this.$ui = {};
      _.each(this.result('ui'), this.resolveUiBy, this);
      return this.$ui;
    },

    /**
     * Resolves one ui element by `selector`
     * @param {string} selector
     * @param {string} alias
     * @returns {*|jQuery|HTMLElement}
     */
    resolveUiBy: function(selector, alias) {
      return this.$ui[alias] = $(selector);
    },

    /**
     * Resolves listenable instance and starts listening
     * @returns {Fiber.View}
     */
    resolveListenable: function() {
      this.prepareListeners(this.result('listeners'));
      var listenable = null;

      if (_.isString(this.listens) && this.has(this.listens))
        listenable = this.result(this.listens);
      else if (_.isFunction(this.listens)) listenable = this.listens;

      if (listenable) this.listenTo(listenable, 'all', this.allEventsHandler.bind(this));
      return this;
    },

    /**
     * Creates listeners collection from given `listeners`
     * @param {Object} listeners
     * @returns {Object.<Listeners>}
     */
    prepareListeners: function(listeners) {
      return this.listeners = new Listeners(this.splitEvents(listeners));
    },

    /**
     * Splits events object to events and handlers arrays
     * @param {Object} events
     * @returns {Array}
     */
    splitEvents: function(events) {
      var options = [];
      for (var key in events) options.push({
        events: key.split(' '),
        handlers: events[key].split(' ')
      });
      return options;
    },

    /**
     * All events handler
     * @param {string} event
     * @param {...args}
     */
    allEventsHandler: function(event, listenable) {
      var args = _.tail(arguments);
      this.listeners.applyHandler(this, event, args);
      this.fire.apply(this, [event].concat(args));
    },

    /**
     * Add a single event listener to the view's element (or a child element
     * using `selector`). This only works for delegate-able events: not `focus`,
     * `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
     * @param {string} event
     * @param {string|Function} selector
     * @param {?Function} [cb]
     * @example
     *
     * view.delegate('click', function() {});
     * view.delegate('click', '.button', function() {});
     */
    delegate: function(event, selector, cb) {
      if (arguments.length === 2) {
        cb = selector;
        selector = '';
      }

      this.apply(Backbone.View, 'delegate', [event, selector, cb]);
    },

    /**
     * Starts transmitting events
     * @return {Fiber.View}
     */
    startTransmitting: function() {
      var transmit = this.splitEvents(this.result('transmit'));
      for (var i = 0; i < transmit.length; i ++) {
        var transmitted = transmit[i];

        for (var j = 0; j < transmitted.events.length; j ++) {
          var event = transmitted.events[j];

          this.when(event, function() {
            for (var k = 0; k < transmitted.handlers.length; k ++) {
              var handlerEvent = transmitted.handlers[k];
              this.fire.apply(this, [handlerEvent].concat(_.toArray(arguments)));
            }
          }.bind(this));
        }
      }
      return this;
    },

    /**
     * Stops transmitting events
     * @returns {Fiber.View}
     */
    stopTransmitting: function() {
      var transmit = this.splitEvents(this.result('transmit'));
      for (var i = 0; i < transmit.length; i ++) {
        var eventObj = transmit.events[i];
        for (var j = 0; j < eventObj.events.length; j ++) {
          var event = eventObj.events[j];
          this.stopListening(this, event);
        }
      }

      return this;
    },

    /**
     * Real render function
     * @param {Function} render
     * @return {*}
     */
    callRender: function(render) {
      var result;

      fn.fireCallCyclic(this, 'render', function() {
        this.apply(this, '__beforeRender');
        result = render.call(this);
        this.apply(this, '__afterRender');
      }, {fire: this, call: render});

      this.__rendered = true;
      return result;
    },

    /**
     * Removes view
     */
    remove: function() {
      fn.fireCallCyclic(this, 'remove', function() {
        this.apply(Backbone.View, 'remove', {fire: this});
      });
      this.__rendered = false;
    },

    /**
     * Destroys View
     */
    destroy: function() {
      this.remove();
      this.__reset();
    },

    /**
     * After render private hook
     * @private
     */
    __afterRender: function() {
      this.resolveUi();
    },

    /**
     * Resets View
     * @private
     */
    __reset: function() {
      this.$ui = {};
      this.$parent = null;
      delete this.options;
      this.linked.reset([]);
    },

    /**
     * Handles events with @ui
     * @private
     */
    __handleEventsUi: function() {
      if (! this.events) return;
      var isValidUi = this.ui && ! _.isEmpty(this.ui),
        events = this.result('events'),
        handled = {};

      for (var selector in events) {
        var handler = events[selector];
        if (~ selector.indexOf('@ui.') && isValidUi) {
          var key = selector.split('@ui.')[1];
          if (this.ui[key]) selector = selector.replace('@ui.' + key, this.ui[key]);
        }
        handled[selector] = handler;
      }
      this.events = handled;
    },

    /**
     * Wraps render function
     * @returns {Fiber.View}
     * @private
     */
    __wrapRender: function() {
      this.render = _.wrap(this.render, this.callRender.bind(this));
      return this;
    },
  }
]);
