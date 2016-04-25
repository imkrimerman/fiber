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
  applyOwnProps: function(props) {
    var ownProps = val(props, _.result(this, 'ownProps', []), [_.isArray, _.isFunction]);
    for (var i = 0; i < ownProps.length; i ++) {
      var prop = ownProps[i]
        , propClassValue = _.get(this, prop);

      if (! propClassValue || this.hasOwnProperty(prop)) continue;

      _.set(this, prop, _.cloneDeep(_.get(this, prop), function(value) {
        if (_.isFunction(value)) return value;
        return _.clone(value, true);
      }));
    }
    return this;
  }
});

/**
 * Register Extension
 */
Fiber.fn.extensions.register($OwnProps);
