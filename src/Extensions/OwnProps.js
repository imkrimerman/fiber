/**
 * Fiber Own Properties extension.
 * @type {Object.<Fiber.Extension>}
 */
var $OwnProps = new Fiber.Extension('OwnProps', {

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initWith: 'applyOwnProps',

  /**
   * Properties keys that will be owned by the instance
   * @type {Array|Function}
   */
  ownProps: [],

  /**
   * Ensures that class owns properties
   * @param {?Array|Function} [props]
   * @param {?boolean} [merge=true]
   * @returns {Object}
   */
  applyOwnProps: function(props, merge) {
    var appliedNew = [];
    merge = val(merge, true, _.isBoolean);

    var hasProps = _.result(this, 'ownProps', [])
      , givenProps = val(props, [], [_.isArray, _.isFunction], 'some');

    if (_.isFunction(givenProps)) givenProps = givenProps();
    if (merge) givenProps = hasProps.concat(givenProps);

    for (var i = 0; i < givenProps.length; i ++) {
      var prop = givenProps[i]
        , propClassValue = _.get(this, prop);

      if (_.has(this, prop) || this.hasOwnProperty(prop)) continue;
      if (! _.includes(hasProps, prop)) appliedNew.push(prop);

      _.set(this, prop, _.cloneDeep(propClassValue, function(value) {
        if (_.isFunction(value)) return value;
        return _.clone(value, true);
      }));
    }

//    if (! appliedNew.length) return this;
//
//    if (_.isArray(this.ownProps)) this.ownProps = this.ownProps.concat(appliedNew);
//    else this.ownProps = function() {
//      return hasProps.concat(appliedNew);
//    };

    return this;
  }
});

/**
 * Register Extension
 */
Fiber.fn.extensions.register($OwnProps);
