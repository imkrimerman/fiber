/**
 * Fiber Collection View
 * @class
 * @extends {Fiber.View}
 */
Fiber.CollectionView = Fiber.View.extend({

  /**
   * Default collection class
   * @type {Fiber.Collection}
   */
  CollectionClass: Fiber.Collection,

  /**
   * View class to create for each model
   * @type {Fiber.View}
   */
  ViewClass: Fiber.View,

  /**
   * Collection instance
   * @type {Object.<Fiber.Collection>}
   */
  collection: null,

  /**
   * Sort comparator function to pass to collection
   * @type {Function|string|null}
   */
  comparator: null,

  /**
   * Collection of initial data models to create collection
   * @type {Array}
   */
  data: [],

  /**
   * Element to render Collection to
   * @type {string|Function}
   */
  collectionElement: '.collection-view',

  /**
   * Collection jQuery element found/created in DOM
   * @type {jQuery|null}
   */
  $collectionElement: null,

  /**
   * Instance key to listen to
   * @type {string|Function}
   */
  listens: 'collection',

  /**
   * Events to listen on `listens` instance and trigger methods map
   * @type {Object}
   */
  listeners: {
    'sync update reset': 'render'
  },

  /**
   * Methods list to bind
   * @type {Array|Function}
   */
  bindMethods: ['renderOne', 'removeOne'],

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function|string}
   */
  willExtend: ['CollectionClass', 'comparator', 'collectionElement', '$collectionElement', 'ViewClass'],

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['CollectionClass', 'comparator', 'collectionElement', '$collectionElement', 'ViewClass'],

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
    this.prepareCollection().each(this.renderOne);
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
    this.linked.addView(view);
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
    return this.ViewClass;
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
    if (this.$collectionElement instanceof $) {
      this.$el.append(this.$collectionElement);
      return this.$collectionElement;
    }

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
    options = val(options, {}, _.isPlainObject);
    options.comparator = this.comparator;
    return this.collection = new this.CollectionClass(models, options);
  },

  /**
   * Replaces collection element selector from `ui`
   * @param {string} collectionElement
   * @returns {string}
   */
  replaceCollectionElementUi: function(collectionElement) {
    collectionElement = collectionElement || this.collectionElement;
    if (! _.isString(collectionElement)) return collectionElement;
    if (~ collectionElement.indexOf('@ui'))
      collectionElement = this.ui[collectionElement.replace('@ui.', '')];
    return collectionElement;
  },

  /**
   * Before render private hook
   * @private
   */
  __beforeRender: function() {
    this.__resetModelsView();
    this.linked.reset([]);
  },

  /**
   * Resets models view reference
   * @private
   */
  __resetModelsView: function() {
    this.collection.each(function(model) {
      model.resetView();
    });
  },

  /**
   * After render private hook
   * @private
   */
  __afterRender: function() {
    this.resolveUi();
    this.resolveCollectionElement();
    this.renderCollection();
  }
});
