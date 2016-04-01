Fiber.LayoutManager = Fiber.fn.class.createFullMixinClass({
  /**
   * Returns current layout element
   * @returns {*}
   */
  getElement: function() {
    return (this.current && this.current.$el) || this.$el;
  }
});
