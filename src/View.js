/**
 * Fiber View Class
 * @class
 * @extends {Backbone.View}
 */
Fiber.View = Fiber.fn.class.make(Backbone.View, [
  'NsEvents', 'Mixin', 'Extend', 'OwnProperties', 'Access', {

    /**
     * Parent element to auto attach
     * @var {jQuery}
     */
    $parent: null,

    /**
     * Linked views collection
     * @var {Object.<Fiber.LinkedView>}
     */
    linkedViews: null,

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
      'sync change': 'render'
    },

    proxy: {
      // TODO implement
    },

    /**
     * Events namespace
     * @var {string}
     */
    eventsNs: 'view',

    /**
     * Event catalog
     * @var {Object}
     */
    eventsCatalog: {
      render: 'render',
      rendered: 'rendered'
    },

    /**
     * Properties keys that will be auto extended from initialize object
     * @var {Array|Function|string}
     */
    extendable: [
      'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events',
      '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', 'routeArgs'
    ],

    /**
     * Properties keys that will be owned by the instance
     * @var {Array|Function}
     */
    ownProps: [
      'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events',
      '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', '$ui', 'linkedViews'
    ],

    /**
     * Constructs Model
     * @param {?Object} [options={}]
     */
    constructor: function(options) {
      this.options = options;
      this.cid = _.uniqueId('view-');
      this.linkedViews = new Fiber.LinkedViews();
      this.applyExtend(options);
      this.applyOwnProps();
      this.resolveListenable();
      this.__handleEventsUi();
      this.__wrapRender();
      this._ensureElement();
      this.initialize.apply(this, arguments);
    },

    /**
     * Before render hook
     */
    beforeRender: function() {},

    /**
     * Render View
     * @returns {Fiber.View}
     */
    render: function() {
      if (this.has('template'))
        this.$el.html(this.renderTemplate(this.get('template')));
      if (this.has('$parent'))
        this.attachToParent(this.result('$parent'));
      return this;
    },

    /**
     * After render hook
     */
    afterRender: function() {},

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
      if (_.isString(template)) template = Fiber.fn.template(template);
      if (_.isFunction(template)) template = template(this.makeTemplateData(data));
      return template;
    },

    /**
     * Makes data for template
     * @param {?Object} [additional={}]
     * @returns {Object}
     */
    makeTemplateData: function(additional) {
      var data = this.result('templateData', {});
      if (this.model) data = _.assign({}, data, this.model.toJSON());
      if (this.val(additional, false, _.isPlainObject))
        data = _.assign({}, data, additional);
      data.self = this;
      return data;
    },

    /**
     * Resolves ui elements
     * @returns {Object}
     */
    resolveUi: function() {
      this.$ui = {};
      _.each(this.result('ui'), this.resolveOneUi, this);
      return this.$ui;
    },

    /**
     * Resolves one ui element by `selector`
     * @param {string} selector
     * @param {string} alias
     * @returns {*|jQuery|HTMLElement}
     */
    resolveOneUi: function(selector, alias) {
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
     * @returns {*}
     */
    prepareListeners: function(listeners) {
      var prepared = [];
      for (var key in listeners) prepared.push({
        events: key.split(' '),
        handlers: listeners.split(' ')
      });
      return this.listeners = new Fiber.Listeners(prepared);
    },

    /**
     * All events handler
     * @param {string} event
     * @param {...args}
     */
    allEventsHandler: function(event, listenable) {
      var args = _.tail(arguments);
      this.listeners.applyHandler(this, event, args);
      this.fire(event, args);
    },

    /**
     * Real render function
     * @param {Function} render
     */
    renderFn: function(render) {
      this.beforeRender();
      this.fire('render', this);
      render.call(this);
      this.resolveUi();
      this.afterRender();
      this.fire('rendered', this);
    },

    /**
     * Removes view
     */
    remove: function() {
      this.fire('remove', this);
      this.fn.apply(Backbone.View, 'remove');
      this.fire('removed', this);
    },

    /**
     * Destroys View
     */
    destroy: function() {
      this.remove();
      this.__reset();
    },

    /**
     * Resets View
     * @private
     */
    __reset: function() {
      this.$ui = {};
      this.$parent = null;
      this.linkedViews.reset([]);
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
      this.__origRender = this.render;
      this.render = _.wrap(this.render, this.renderFn.bind(this));
      return this;
    },

    /**
     * Un wraps render function
     * @returns {Fiber.View}
     * @private
     */
    __unwrapRender: function() {
      if (this.__origRender) this.render = this.__origRender;
      return this;
    }
  }
]);
