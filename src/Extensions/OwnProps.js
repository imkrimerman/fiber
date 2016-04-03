/**
 * Fiber Own Properties extension.
 * @type {Object}
 */
var $OwnProps = new Fiber.Extension('OwnProps', {

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initMethod: 'applyOwnProps',

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: [],

  /**
   * Ensures that class owns properties
   * @param {?Function} [Parent]
   * @returns {Object}
   */
  applyOwnProps: function(Parent) {
//    var proto = val(Parent, false, _.isFunction) && Parent.prototype || this.__super__;
    var ownProps = _.result(this, 'ownProps', []);
    for (var i = 0; i < ownProps.length; i ++) {
      var prop = ownProps[i]
        , propValue = _.get(this, prop);
      if (! propValue) continue;
//      if (_.has(this, prop) || ! _.has(proto, prop)) continue;
      _.set(this, prop, _.cloneDeep(_.get(this, prop), function(value) {
        if (_.isFunction(value)) return value;
        return _.clone(value, true);
      }));
    }
    return this;
  }
});
