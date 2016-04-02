Fiber.LayoutManager = Fiber.fn.class.createClassWithExtensions({
  /**
   * Returns current layout element
   * @returns {*}
   */
  getElement: function() {
    return (this.current && this.current.$el) || this.$el;
  }
});
