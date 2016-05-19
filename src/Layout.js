Fiber.Layout = Fiber.View.extend({

  contentSelector: null,

  willExtend: ['contentSelector'],

  ownProps: ['contentSelector'],

  getContentElement: function() {
    return this.$contentElement;
  },

  setContentElement: function($content) {
    if ($isStr($content)) {
      this.contentSelector = $content;
      this.$contentElement = this.$(this.contentSelector);
    }
    else if ($content instanceof $) {
      this.contentSelector = $content.selector;
      this.$contentElement = $content;
    }
    else {
      this.contentSelector = this.$el.selector;
      this.$contentElement = this.$el;
    }

    return this;
  },

  hasContentElement: function() {
    return this.getContentElement() instanceof $;
  },

  renderToContentElement: function(view) {
    this._views.show(this.contentSelector, view);
    this._linked.addView(view);
    return this;
  },

  _afterRender: function() {
    this.setContentElement(this.contentSelector);
    this.$super('_afterRender', arguments);
  },
});
