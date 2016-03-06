/**
 * Fiber Layout
 * @class
 */
Fiber.Layout = Fiber.View.extend({

  /**
   * Class name
   * @type {string}
   */
  className: 'layout',

  /**
   * Layout type
   * @type {string}
   */
  type: 'base',

  /**
   * Class options
   * @type {Array}
   */
  extendable: ['type'],

  /**
   * Own properties
   * @type {Array}
   */
  ownProps: ['type', 'page'],

  /**
   * Layout page
   * @type {Object.<Page>}
   */
  page: null,

  /**
   * Layout rendered flag
   * @type {boolean}
   */
  __rendered: false,

  /**
   * After render hook
   */
  afterRender: function() {
    this.__rendered = true;
  },

  /**
   * Renders page
   * @param {Page} page
   * @return {Fiber.Layout}
   */
  renderPage: function(page) {
    this.page = page;
    this.page.bootstrap();
    this.page.load();
    this.html(this.page.getElement());
    return this;
  },

  /**
   * Removes page
   * @returns {Fiber.Layout}
   */
  removePage: function() {
    this.page.unload();
    this.page = null;
    return this;
  }
});
