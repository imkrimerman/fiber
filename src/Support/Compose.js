/**
 * Compose support
 * @type {Object}
 */
Fiber.fn.compose = {

  /**
   * Composes View with provided options
   * @param {function(...)} View
   * @param {?Object} [options]
   * @param {...args}
   * @returns {*|function(...)|Fiber.View}
   */
  view: function(View, options) {
    if (! ($fn.class.isBackboneClass(View)))
      $log.throws('View cannot be composed.', View, options);

    options = $val(options, {}, _.isPlainObject);

    var args = _.drop(arguments, 2)
      , CollectionClass = options.Collection
      , Collection = options.collection
      , ModelClass = options.Model
      , Model = options.model
      , hasCollection = ! _.isEmpty(Collection) || ! _.isEmpty(CollectionClass)
      , hasModel = ! _.isEmpty(Model) || ! _.isEmpty(ModelClass)
      , compose = $fn.compose
      , extender = {};

    if (hasCollection) extender = { collection: compose.collection(CollectionClass, options) };
    else if (hasModel) extender = { model: compose.model(ModelClass, options) };
    return compose.initialize.apply(null, [View, extender].concat(args));
  },

  /**
   * Composes Collection
   * @param {Array|Backbone.Collection} Collection
   * @param {?Array|Backbone.Model} [Model]
   * @param {...args}
   * @returns {function(...)}
   */
  collection: function(Collection, options) {
    options = $valMerge(options, { Model: false, model: false, extender: {}, args: [] });
    var args = [Collection]
      , partials = $val(_.drop(arguments, 2), [], _.isEmpty)
      , compose = $fn.compose
      , Model = options.Model
      , model = options.model
      , modelArg = { model: model };

    if ($fn.class.isBackboneClass(Model)) modelArg.model = compose.model(Model, options);
    else if ($fn.class.isBackboneInstance(model)) args.push(modelArg);
    return compose.initialize.apply(null, args.concat(partials));
  },

  /**
   * Composes Model
   * @param {Backbone.Model} Model
   * @param {?Object} [extender]
   * @param {?Array} [args]
   * @returns {*|function(...)}
   */
  model: function(Model, options) {
    options = $valMerge(options, { extender: {}, args: [] });
    if (! _.isEmpty(options.extender) && fn.class.isBackboneClass(Model))
      Model = $fn.class.make(Model, options.extender);
    return $fn.compose.initialize(Model, options.args);
  },

  /**
   * Initializes component
   * @param {Array|function(...)} Component
   * @param {...args}
   * @returns {function(...)}
   */
  initialize: function(Component) {
    var args = _.drop(arguments);

    if (_.isArray(Component)) {
      args = _.drop(Component).concat(args);
      Component = _.first(Component);
    }

    if (! args.length) return new Component;
    return $fn.class.instance(Component, args);
  },
};
