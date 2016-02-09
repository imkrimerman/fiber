// Own Properties extension.
Fiber.addExtension('OwnProperties', {

  // Properties keys that will be owned by the instance
  ownProps: [],

  // Ensures that class owns properties
  applyOwnProps: function() {
    for (var i = 0; i < this.ownProps.length; i ++) {
      var prop = this.ownProps[i];
      if (this.hasOwnProperty(prop)) continue;
      this[prop] = _.cloneDeep(this[prop], function(value) {
        if (_.isFunction(value)) return value;
        return _.clone(value, true);
      });
    }
    return this;
  }
});