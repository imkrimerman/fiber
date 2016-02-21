/**
 * Fiber Layout
 * @class
 */
Fiber.Layout = Fiber.View.extend({

  /**
   * Class name
   * @type {String}
   */
  className: 'layout',

  /**
   * Layout type
   * @type {String}
   */
  type: 'base',

  /**
   * Class options
   * @type {Array}
   */
  classOptions: ['type'],

  /**
   * Own properties
   * @type {Array}
   */
  ownProps: ['type', 'page'],

  /**
   * Layout page
   * @type {Object<Page>}
   */
  page: null,

  /**
   * Is layout rendered
   * @type {boolean}
   */
  rendered: false,

  /**
   * After render hook
   */
  afterRender: function() {
    this.rendered = true;
  },

  /**
   * Renders page
   * @param {Page} page
   * @return {Layout}
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
   * @param [{Page}] page
   * @returns {Layout}
   */
  removePage: function() {
    this.page.unload();
    this.template = null;
    this.page = null;
    return this;
  }
});
