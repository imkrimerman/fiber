// Fiber Collection View
Fiber.CollectionView = Fiber.View.extend({

  // Defaults collection class
  collectionClass: Fiber.Collection,

  // Collection instance
  collection: null,

  // Collection initial models to create collection from
  models: [],

  // Element to render Collection to
  collectionElement: '.collection-view',

  // Collection jQuery element found/created in DOM
  $collectionElement: null,

  // View class to create View for each model
  modelViewClass: Fiber.View,

  // Instance key to listen to
  listens: 'collection',

  // Events listeners
  listeners: [{
    events: ['sync', 'update', 'clear'],
    handler: 'render'
  }],

  // Events namespace
  eventsNs: 'collectionView',

  // Constructor
  constructor: function() {
    Fiber.View.apply(this, arguments);
    this.replaceCollectionElementUi();
    if (! this.collection) this.createCollection(this.models);
  },

  // Renders collection
  renderCollection: function() {
    this.clearCollectionElement();
    this.prepareCollection().each(this.renderOne, this);
    return this;
  },

  // Prepares collection for render
  prepareCollection: function() {
    return this.collection;
  },

  // Renders one model
  renderOne: function(model) {
    var View = this.getModelViewClass(model)
      , view = this.createModelView(View, {model: model});

    view.render();

    this.$collectionElement.append(view.$el);
    return view;
  },

  // Removes view by given `model`
  removeOne: function(model) {
    var view = model.getView();
    if (view) view.remove();
    return view;
  },

  // Creates model view
  createModelView: function(View, options) {
    var view = new View(options);
    this.linkedViews.addView(view);
    view.model.setView(view);
    return view;
  },

  // Returns model view class
  getModelViewClass: function(model) {
    if (model.has('viewClass')) return model.get('viewClass');
    return this.modelViewClass;
  },

  // Clears collection element
  clearCollectionElement: function() {
    if (this.$collectionElement instanceof $)
      this.$collectionElement.empty();
    return this;
  },

  // Resolves collection element in DOM
  resolveCollectionElement: function() {
    var $element = this.$(this.collectionElement);
    if ($element.length) return this.$collectionElement = $element;

    var props = {};
    if (this.collectionClass[0] === '.')
      props['class'] = this.collectionClass.slice(1).split('.').join(' ');
    else if (this.collectionClass[0] === '#')
      props.id = this.collectionClass.slice(1);

    $element = $('<div />', props);
    this.$el.append($element);
    return this.$collectionElement = $element;
  },

  // Creates collection
  createCollection: function(models, options) {
    var CollectionClass = this.collectionClass;
    return this.collection = new CollectionClass(models, options);
  },

  // Real render function
  renderFn: function(render) {
    this.fire('render', this);
    this.beforeRender();
    render.call(this);
    this.resolveUi();
    this.resolveCollectionElement();
    this.renderCollection();
    this.afterRender();
    this.fire('rendered', this);
  },

  //  Replaces collection element selector from `ui`
  replaceCollectionElementUi: function() {
    if (~this.collectionElement.indexOf('@ui'))
      this.collectionElement = this.ui[this.collectionElement.replace('@ui.', '')];
    return this;
  }
});
