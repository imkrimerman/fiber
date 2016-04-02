/**
 * Fiber View Class
 * @class
 * @extends {Backbone.View}
 */
Fiber.View = Fiber.fn.class.make(Backbone.View, [
  'Mixin', 'Extend', 'OwnProps', 'Access', 'Binder', {

    /**
     * Parent element to auto attach
     * @var {jQuery}
     */
    $parent: null,

    /**
     * Linked views collection
     * @var {Object.<Fiber.LinkedView>}
     */
    linked: null,

    /**
     * View ui selectors
     * @var {Object}
     */
    ui: {},

    /**
     * View `$ui` found elements by `ui` selector
     * @var {Object}
     */
    $ui: {},

    /**
     * Instance key to listen to
     * @var {string}
     */
    listens: 'model',

    /**
     * Events listeners
     * @var {Object}
     */
    listeners: {
      change: 'render'
    },

    /**
     * Events that should be retransmitted
     * @var {Object}
     */
    transmit: {},

    /**
     * Rendered flag
     * @var {boolean}
     */
    __rendered: false,

    /**
     * Properties keys that will be auto extended from initialize object
     * @var {Array|Function|string}
     */
    extendable: [
      'model', 'collection', 'el', 'id', 'className', 'tagName', 'events',
      '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', 'transmit'
    ],

    /**
     * Properties keys that will be owned by the instance
     * @var {Array|Function}
     */
    ownProps: [
      'model', 'collection', 'el', 'id', 'className', 'tagName', 'events', 'linked', '__rendered',
      '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', '$ui', 'transmit'
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
      if (_.isString(template)) return Fiber.fn.template.compile(template, data);
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
      _.isPlainObject(additional) && _.extend(data, additional);
      data.self = this;
      return data;
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
     * @returns {Object.<Fiber.Listeners>}
     */
    prepareListeners: function(listeners) {
      return this.listeners = new Fiber.Listeners(this.splitEvents(listeners));
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
      Fiber.fn.fireCallCycle(this, 'render', function() {
        this.apply(this, '__beforeRender');
        result = render.call(this);
        this.apply(this, '__afterRender');
      }, {fire: this, invoke: render});

      this.__rendered = true;
      return result;
    },

    /**
     * Removes view
     */
    remove: function() {
      Fiber.fn.fireCallCycle(this, 'remove', function() {
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
          events    = this.result('events'),
          handled   = {};

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
