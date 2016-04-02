Fiber.LayoutManager = Fiber.fn.class.createWithExtensions({
  /**
   * Returns current layout element
   * @returns {*}
   */
  getElement: function() {
    return (this.current && this.current.$el) || this.$el;
  }
});
