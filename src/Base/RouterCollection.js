Fiber.RouterCollection = BaseCollection.extend({

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: ['router'],

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|Function|string}
   */
  extendable: ['router'],

  /**
   * Router instance
   * @type {Object.<Fiber.Router>}
   */
  router: null,

  /**
   * Sets current router
   * @param {Object.<Fiber.Router>} router
   * @returns {Fiber.RouterCollection}
   */
  setRouter: function(router) {
    this.router = router;
    return this;
  },

  /**
   * Returns current router
   * @returns {Object.<Fiber.Router>}
   */
  getRouter: function() {
    return this.router;
  },

  /**
   * Determines if valid router is attached to the collection
   * @returns {boolean}
   */
  hasRouter: function() {
    return ! _.isEmpty(this.router);
  },
});
