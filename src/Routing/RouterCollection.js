/**
 * Fiber Router Collection
 * @class
 * @extends {BaseCollection}
 */
Fiber.RouterCollection = BaseCollection.extend({

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|function(...)}
   */
  ownProps: ['router'],

  /**
   * Properties keys that will be auto extended from initialize object
   * @type {Array|function(...)|string}
   */
  willExtend: ['router'],

  /**
   * Router instance
   * @type {Object.<Fiber.Router>}
   * @private
   */
  _router: null,

  /**
   * Sets current router
   * @param {Object.<Fiber.Router>} router
   * @returns {Fiber.RouterCollection}
   */
  setRouter: function(router) {
    this._router = router instanceof Fiber.Router && router;
    return this;
  },

  /**
   * Returns current router
   * @returns {Object.<Fiber.Router>}
   */
  getRouter: function() {
    return this._router;
  },

  /**
   * Determines if valid router is attached to the collection
   * @returns {boolean}
   */
  hasRouter: function() {
    return ! _.isEmpty(this._router);
  },

  /**
   * Removes `router` reference
   * @returns {Fiber.RouterCollection}
   */
  forgetRouter: function() {
    this._router = null;
    return this;
  },
});
