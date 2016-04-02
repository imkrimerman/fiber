/**
 * Fiber Own Properties extension.
 * @type {Object}
 */
var $OwnProps = new Fiber.Extension({

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initMethodName: 'applyOwnProps',

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: [],

  /**
   * Ensures that class owns properties
   * @returns {*}
   */
  applyOwnProps: function() {
    for (var i = 0; i < this.ownProps.length; i ++) {
      var prop = this.ownProps[i];
      if (_.has(this, prop) || ! _.has(this.__proto__, prop)) continue;
      this[prop] = _.cloneDeep(this[prop], function(value) {
        if (_.isFunction(value)) return value;
        return _.clone(value, true);
      });
    }
    return this;
  }
});
