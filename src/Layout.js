Fiber.Layout = Fiber.View.extend({

  contentSelector: null,

  willExtend: ['contentSelector'],

  ownProps: ['contentSelector'],

  getContentElement: function() {
    return this.$contentElement;
  },

  setContentElement: function($content) {
    if (_.isString($content)) {
      this.contentSelector = $content;
      this.$contentElement = this.$(this.contentSelector);
    }
    else if ($content instanceof Fiber.$) {
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
    return this.getContentElement() instanceof Fiber.$;
  },

  renderToContentElement: function(view) {
    this.viewsManager.show(this.contentSelector, view);
    this.linked.addView(view);
    return this;
  },

  __afterRender: function() {
    this.setContentElement(this.contentSelector);
    this.apply(this.__parent__, '__afterRender', arguments);
  },
});
