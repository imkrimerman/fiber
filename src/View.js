/**
 * Fiber View Class
 * @class
 * @extends {Backbone.View}
 */
Fiber.View = $fn.class.make(Backbone.View, [
  $Access, $OwnProps, $Events, $Extend, $Binder, $Extensions, {

    /**
     * Parent element to auto attach
     * @type {jQuery|HTMLElement|string}
     */
    $parent: null,

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
     * Listener configuration
     * @type {Object}
     */
    listens: {

      /**
       * Instance key to listen to
       * @type {string}
       */
      to: 'model',

      /**
       * Events listeners
       * @type {Object}
       */
      on: {
        change: 'render'
      }
    },

    /**
     * Linked views collection
     * @type {Object.<Fiber.LinkedView>}
     */
    _linked: null,

    /**
     * Views manager instance
     * @type {Object.<Fiber.Views>}
     */
    _views: null,

    /**
     * Rendered flag
     * @type {boolean}
     */
    _rendered: false,

    /**
     * Properties keys that will be auto extended from initialize object
     * @type {Array|function(...)|string}
     */
    willExtend: [
      'model', 'collection', 'el', 'id', 'className', 'tagName', 'events', 'template', 'templateData',
      '$parent', 'ui', 'listens'
    ],

    /**
     * Properties keys that will be owned by the instance
     * @type {Array|function(...)}
     */
    ownProps: function() {
      return this.willExtend.concat(['$ui', '_linked', '_views', '_rendered']);
    },

    /**
     * Methods list to bind
     * @type {Array|function(...)}
     */
    bindMethods: ['render', '_callRender'],

    /**
     * Constructs View
     * @param {?Object} [options={}]
     */
    constructor: function(options) {
      this.cid = _.uniqueId('view@');
      $fn.class.handleOptions(this, options);
      $fn.extensions.init(this);
      this._handleListeners();
      this._handleEventsUi();
      this._wrapRender();
      this._ensureElement();
      this._linked = new Fiber.LinkedViews();
      this._views = new Fiber.Views(this.$el);
      this.initialize.apply(this, arguments);
      Fiber.$ && this.$el.data('fiber.view', this);
    },

    /**
     * Render View
     * @returns {Fiber.View}
     */
    render: function() {
      if (this.has('template')) this.renderTemplate(this.get('template'));
      if (this.has('$parent')) this.attachToParent(this.result('$parent'));
      return this;
    },

    /**
     * Attaches View to parent element
     * @param {string|$} $parent
     * @param {string} [fn='html']
     * @returns {Fiber.View}
     */
    attachToParent: function($parent, fn) {
      if (! Fiber.$) return this;
      if (_.isString($parent)) $parent = Fiber.$($parent);
      if ($parent instanceof Fiber.$) $parent[$val(fn, 'html')](this.$el);
      return this;
    },

    /**
     * Renders template
     * @param {string|function(...)} template
     * @param {?Object} [data={}]
     * @returns {string}
     */
    renderTemplate: function(template, data) {
      return this.html(this.compileTemplate(template, data));
    },

    /**
     * Compiles template
     * @param {string|function(...)} template
     * @param {?Object} [data={}]
     * @returns {string}
     */
    compileTemplate: function(template, data) {
      data = this.makeTemplateData(data);
      if (_.isString(template)) return $fn.template.compile(template, data);
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
      if (this.model) data = $fn.merge(data, this.model.toJSON(), additional || {});
      data.self = this;
      return data;
    },

    /**
     * Resolves ui elements
     * @returns {Object}
     */
    resolveUi: function() {
      this.$ui = {};
      $each(this.result('ui'), this.resolveOneUi, this);
      return this.$ui;
    },

    /**
     * Resolves one ui element by `selector`
     * @param {string} selector
     * @param {string} alias
     * @returns {*|jQuery|HTMLElement}
     */
    resolveOneUi: function(selector, alias) {
      if (! Fiber.$) return {};
      return this.$ui[alias] = Fiber.$(selector);
    },

    /**
     * Sets view element html or returns it
     * @param {string} html
     * @returns {Fiber.View}
     */
    html: function(html) {
      if (! Fiber.$) return this;
      this.$el.html(html);
      return this;
    },

    /**
     * Add a single event listener to the view's element (or a child element
     * using `selector`). This only works for delegate-able events: not `focus`,
     * `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
     * @param {string} event
     * @param {string|function(...)} selector
     * @param {?function(...)} [cb]
     * @example
     *
     * view.delegate('click', function(...) {});
     * view.delegate('click', '.button', function(...) {});
     */
    delegate: function(event, selector, cb) {
      if (arguments.length === 2) {
        cb = selector;
        selector = '';
      }
      this.$super('delegate', [event, selector, cb]);
    },

    /**
     * Shows sub view at the given selector
     * @param {string} selector
     * @param {Object.<Fiber.View>} view
     * @returns {Fiber.View}
     */
    showView: function(selector, view) {
      this._views.show(selector, view);
      return this;
    },

    /**
     * Shuts down sub view and cleans up
     * @param {string} selector
     * @returns {Fiber.View}
     */
    closeView: function(selector) {
      this._views.close(selector);
      return this;
    },

    /**
     * Refreshes view at the given selector
     * @param {string} selector
     * @returns {Fiber.View}
     */
    refreshView: function(selector) {
      this._views.refresh(selector);
      return this;
    },

    /**
     * Removes view
     * @return {Fiber.View}
     */
    remove: function() {
      $fn.fireCallCyclic(this, 'remove', function() {
        this.clearBoundEvents();
        this.$super('remove', { fire: this });
      });
      this._rendered = false;
      return this;
    },

    /**
     * Destroys View
     * @return {Fiber.View}
     */
    destroy: function() {
      this.remove();
      this.clearChannels();
      this.resetEventProperties();
      this._resetProperties();
      return this;
    },

    /**
     * Determine if view is rendered
     * @returns {boolean}
     */
    isRendered: function() {
      return this._rendered;
    },

    /**
     * Real render function
     * @param {function(...)} render
     * @return {*}
     * @private
     */
    _callRender: function(render) {
      var result;
      $fn.fireCallCyclic(this, 'render', function() {
        this.$apply(this, '_beforeRender');
        result = render.call(this);
        this.$apply(this, '_afterRender');
      }, { fire: this, call: render });
      this._rendered = true;
      return result;
    },

    /**
     * Before render private hook
     * @private
     */
    _beforeRender: function() {},

    /**
     * After render private hook
     * @private
     */
    _afterRender: function() {
      this.resolveUi();
    },

    /**
     * Wraps render function
     * @returns {Fiber.View}
     * @private
     */
    _wrapRender: function() {
      this.render = _.wrap(this.render, this._callRender.bind(this));
      return this;
    },

    /**
     * Resolves listenable object if exists and starts listening to the specified events
     * @returns {Fiber.View}
     * @private
     */
    _handleListeners: function() {
      var listens = this.result('listens', { to: '', on: {} })
        , events = listens.on
        , listenable = listens.to;
      this._createListeners(events);
      if (_.isString(listenable) && this.has(listenable)) listenable = this.result(listenable);
      else if (! listenable || ! (listenable instanceof Backbone.Events)) $log.logReturn(
        'warn', 'Can not subscribe. `Listenable` is not instance of Backbone.Eventable.', [listenable], this
      );
      this.listenTo(listenable, 'all', this._allEventsHandler.bind(this));
      return this;
    },

    /**
     * Handles events with @ui prefix
     * @return {Fiber.View}
     * @private
     */
    _handleEventsUi: function() {
      if (! this.events) return this;
      var ui = this.result('ui')
        , signature = '@ui.'
        , isValidUi = ! _.isEmpty(ui)
        , events = this.result('events')
        , handled = {};

      $each(events, function(handler, selector) {
        if (! _.startsWith(selector, signature) || ! isValidUi)
          return $log.warn('Can not resolve selector `' + selector + '`. Not found in `ui` object or is not valid.');
        var key = selector.split(signature)[1];
        if (ui[key]) selector = selector.replace(signature + key, ui[key]);
        handled[selector] = handler;
      });

      this.events = handled;
    },

    /**
     * Creates listeners collection from given `listeners`
     * @param {Object} listeners
     * @returns {Object.<Listeners>}
     * @private
     */
    _createListeners: function(listeners) {
      return this.listeners = new Listeners(this._splitListenerEvents(listeners));
    },

    /**
     * Splits events object to events and handlers arrays
     * @param {Object} events
     * @returns {Array}
     * @private
     */
    _splitListenerEvents: function(events) {
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
     * @private
     */
    _allEventsHandler: function(event, listenable) {
      var args = _.tail(arguments);
      this.listeners.applyHandler(this, event, args);
      this.fire.apply(this, [event].concat(args));
    },

    /**
     * Resets View properties
     * @return {Fiber.View}
     * @private
     */
    _resetProperties: function() {
      this.$ui = {};
      this.$parent = null;
      delete this.options;
      this._linked.reset([]);
      return this;
    }
  }
]);
