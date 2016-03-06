/**
 * Fiber Collection View
 * @class
 * @extends {Fiber.View}
 */
Fiber.CollectionView = Fiber.View.extend({

  /**
   * Default collection class
   * @var {Fiber.Collection}
   */
  collectionClass: Fiber.Collection,

  /**
   * Collection instance
   * @var {Object.<Fiber.Collection>}
   */
  collection: null,

  /**
   * Collection of initial data models to create collection
   * @var {Array}
   */
  data: [],

  /**
   * Element to render Collection to
   * @var {string|Function}
   */
  collectionElement: '.collection-view',

  /**
   * Collection jQuery element found/created in DOM
   * @var {jQuery|null}
   */
  $collectionElement: null,

  /**
   * View class to create View for each model
   * @var {Fiber.View}
   */
  modelViewClass: Fiber.View,

  /**
   * Instance key to listen to
   * @var {string|Function}
   */
  listens: 'collection',

  /**
   * Events to listen on `listens` instance and trigger methods map
   * @var {Object}
   */
  listeners: {
    'sync update clear': 'render'
  },

  /**
   * Events namespace
   * @var {string}
   */
  eventsNs: 'collectionView',

  /**
   * Constructs collection view
   */
  constructor: function() {
    Fiber.View.apply(this, arguments);
    if (! this.collection) this.createCollection(this.data);
  },

  /**
   * Renders collection
   * @returns {Fiber.CollectionView}
   */
  renderCollection: function() {
    this.clearCollectionElement();
    this.prepareCollection().each(this.renderOne, this);
    return this;
  },

  /**
   * Prepares collection for render
   * @returns {Object.<Fiber.Collection>}
   */
  prepareCollection: function() {
    return this.collection;
  },

  /**
   * Renders one model
   * @param {Object.<Fiber.Model>} model
   * @returns {Object.<Fiber.View>}
   */
  renderOne: function(model) {
    var View = this.getModelViewClass(model)
      , view = this.createModelView(View, {model: model});

    view.render();

    this.$collectionElement.append(view.el);
    return view;
  },

  /**
   * Removes view by given `model`
   * @param {Object.<Fiber.Model>} model
   * @returns {*|Fiber.View|null}
   */
  removeOne: function(model) {
    var view = model.getView();
    if (view) view.remove();
    return view;
  },

  /**
   * Creates model view
   * @param {Fiber.View} View
   * @param {Object} options
   * @returns {Object.<Fiber.View>}
   */
  createModelView: function(View, options) {
    var view = new View(options);
    this.linkedViews.addView(view);
    view.model.setView(view);
    return view;
  },

  /**
   * Returns model view class
   * @param {Object.<Fiber.Model>} model
   * @returns {Fiber.View}
   */
  getModelViewClass: function(model) {
    if (model.has('viewClass')) return model.get('viewClass');
    return this.modelViewClass;
  },

  /**
   * Clears collection element
   * @returns {Fiber.CollectionView}
   */
  clearCollectionElement: function() {
    if (this.$collectionElement instanceof $)
      this.$collectionElement.empty();
    return this;
  },

  /**
   * Resolves collection element in DOM
   * @returns {jQuery|HTMLElement}
   */
  resolveCollectionElement: function() {
    var collectionEl = _.result(this, 'collectionElement');
    collectionEl = this.replaceCollectionElementUi(collectionEl);

    var $element = this.$(collectionEl);
    if ($element.length) return this.$collectionElement = $element;

    var props = {};
    if (collectionEl[0] === '.')
      props['class'] = collectionEl.slice(1).split('.').join(' ');
    else if (collectionEl[0] === '#')
      props.id = collectionEl.slice(1);

    $element = $('<div />', props);
    this.$el.append($element);
    return this.$collectionElement = $element;
  },

  /**
   * Creates collection
   * @param {Array} models
   * @param {Object} [options]
   * @returns {Object.<Fiber.Collection>}
   */
  createCollection: function(models, options) {
    return this.collection = new this.collectionClass(models, options);
  },

  /**
   * Real render function
   * @param {Function} render
   */
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

  /**
   * Replaces collection element selector from `ui`
   * @param {string} collectionElement
   * @returns {string}
   */
  replaceCollectionElementUi: function(collectionElement) {
    collectionElement = collectionElement || this.collectionElement;
    if (~collectionElement.indexOf('@ui'))
      collectionElement = this.ui[collectionElement.replace('@ui.', '')];
    return collectionElement;
  }
});
