Fiber.Router = Fiber.fn.class.make(Backbone.Router, [
  'Extend', 'OwnProperties', 'Binder', 'Access', 'NsEvents', 'Mixin', {

    /**
     * Collections holder
     * @var {Object}
     */
    collections: {
      routes: null,
      middleware: null
    },

    /**
     * Collections options
     * @var {Object}
     */
    collectionOptions: {
      routes: { model: Fiber.Route },
      middleware: { model: Fiber.Middleware }
    },

    /**
     * Constructs Router
     * @param {?Object} [options={}]
     */
    constructor: function(options) {
      this.options = options || (options = {});
      this.applyExtend(options);
      this.applyOwnProps();
      this.applyBinder();
      this.createCollections(options);
      this._bindRoutes();
      this.initialize.apply(this, arguments);
    },

    /**
     * Initializes Router
     * @param {?Object} [options={}]
     */
    initialize: function(options) {},



    /**
     * Creates Collections
     * @param {?Object} [options={}]
     */
    createCollections: function(options) {
      options = val(options, {}, _.isPlainObject);
      var collections = _.keys(this.collections);
      for (var i = 0; i < collections.length; i ++) {
        var collection = collections[i]
          , models     = this.prepareCollectionData(options[collection])
          , options    = this.collectionOptions[collection] || {};
        this.collections[collection] = new Fiber.Collection(models, options);
      }
    },

    /**
     * Prepares collection data
     * @param {Array|Object} data
     * @returns {Array}
     */
    prepareCollectionData: function(data) {
      if (_.isEmpty(data)) return [];

      if (_.isPlainObject(data)) {
        for (var alias in data) {
          var route = data[alias];
          if (_.has(route, 'alias')) continue;
          route[alias].alias = alias;
        }

        data = _.values(data);
      }

      return data;
    },

  }
]);
