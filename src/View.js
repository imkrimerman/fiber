// Fiber View
Fiber.View = Fiber.make(Backbone.View, ['NsEvents', 'Mixin', 'Extendable', 'OwnProperties', 'Access', {

  // Parent View
  $parent: null,

  // Linked views collection
  linkedViews: null,

  // View ui selectors
  ui: {},

  // View `$ui` found elements by `ui` selector
  $ui: {},

  // Instance key to listen to
  listens: 'model',

  // Events listeners
  listeners: [{
    events: ['sync', 'change'],
    handler: 'render'
  }],

  // Events namespace
  eventsNs: 'view',

  // Event catalog
  eventsCatalog: {
    render: 'render',
    rendered: 'rendered'
  },

  extendable: ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events',
               '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', 'routeArgs'],

  ownProps: ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events',
             '$parent', 'ui', 'listens', 'listeners', 'template', 'templateData', '$ui', 'linkedViews'],

  // Constructor
  constructor: function(options) {
    this.cid = _.uniqueId('view-');
    this.linkedViews = new Fiber.LinkedViews();
    this.applyExtendable(options);
    this.applyOwnProps();
    this.resolveListenable();
    this.__handleEventsUi();
    this.__wrapRender();
    this._ensureElement();
    this.initialize.apply(this, arguments);
  },


  // Before render hook
  beforeRender: function() {},

  // Render View
  render: function() {
    if (this.has('template'))
      this.$el.html(this.renderTemplate(this.get('template')));
    if (this.has('$parent'))
      this.attachToParent(this.result('$parent'));
    return this;
  },

  // After render hook
  afterRender: function() {},

  // Attaches View to parent element
  attachToParent: function($parent) {
    if (_.isString($parent)) $parent = $($parent);
    if ($parent instanceof $) $parent.html(this.$el);
    return this;
  },

  // Sets view element html or returns it
  html: function(html) {
    this.$el.html(html);
    return this;
  },

  // Renders template
  renderTemplate: function(template, data) {
    if (_.isString(template)) template = Fiber.fn.template(template);
    if (_.isFunction(template)) template = template(this.makeTemplateData(data));
    return template;
  },

  // Makes data for template
  makeTemplateData: function(additional) {
    var data = this.result('templateData', {});
    if (this.model) data = _.assign({}, data, this.model.toJSON());
    if (this.val(additional, false, _.isPlainObject))
      data = _.assign({}, data, additional);
    data.self = this;
    return data;
  },

  // Resolves ui elements
  resolveUi: function() {
    this.$ui = {};
    _.each(this.result('ui'), this.resolveOneUi, this);
    return this.$ui;
  },

  // Resolves one ui element by `selector`
  resolveOneUi: function(selector, alias) {
    return this.$ui[alias] = this.$(selector);
  },

  // Resolves listenable instance and starts listening
  resolveListenable: function() {
    this.prepareListeners(this.result('listeners'));
    if (! _.isString(this.listens) || ! this.has(this.listens)) return this;
    this.listenTo(this.result(this.listens), 'all', this.allEventsHandler.bind(this));
    return this;
  },

  // Creates listeners collection from given `listeners`
  prepareListeners: function(listeners) {
    if (! _.isArray(listeners))
      if (_.isPlainObject(listeners)) listeners = [listeners];
      else listeners = [];
    return this.listeners = new Fiber.Listeners(listeners);
  },

  // All events handler
  allEventsHandler: function(event, listenable) {
    var args = _.toArray(arguments).slice(1);
    this.fire(event, args);
    if (this.listeners.hasEvent(event)) {
      var handler = this.listeners.getEventHandler(event);
      if (_.isArray(handler)) _.each(handler, function(oneHandler) {
        this.applyEventHandler(oneHandler, args);
      }, this);
      this.applyEventHandler(handler, args);
    }
  },

  // Applies event handler
  applyEventHandler: function(handler, args) {
    if (_.isString(handler)) handler = this[handler];
    if (_.isFunction(handler)) return handler.apply(this, args);
  },

  // Real render function
  renderFn: function(render) {
    this.beforeRender();
    this.fire('render', this);
    render.call(this);
    this.resolveUi();
    this.afterRender();
    this.fire('rendered', this);
  },

  // Removes view
  remove: function() {
    this.fire('remove', this);
    this.unbind();
    this.linkedViews.parentView = null;
    this.linkedViews.reset([]);
    this.$parent = null;
    this.$ui = {};
    Fiber.fn.apply(Backbone.View, 'remove');
    this.fire('removed', this);
  },

  // Handles events with @ui
  __handleEventsUi: function() {
    if (! this.events) return;
    var isValidUi = this.ui && ! _.isEmpty(this.ui),
        events = this.result('events'),
        handled = {};

    for (var selector in events) {
      var handler = events[selector];
      if (~selector.indexOf('@ui.') && isValidUi) {
        var key = selector.split('@ui.')[1];
        if (this.ui[key]) selector = selector.replace('@ui.' + key, this.ui[key]);
      }
      handled[selector] = handler;
    }
    this.events = handled;
  },

  // Wraps render function
  __wrapRender: function() {
    this.__origRender = this.render;
    this.render = _.wrap(this.render, this.renderFn.bind(this));
    return this;
  },

  // Un wraps render function
  __unwrapRender: function() {
    if (this.__origRender) this.render = this.__origRender;
    return this;
  }
}], {extend: extend});