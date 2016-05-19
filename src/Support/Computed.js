/**
 * Computed Properties support
 * @type {Object}
 */
Fiber.fn.computed = {

  /**
   * Postfix to use to create method name
   * @type {string}
   */
  postfix: 'Attribute',

  /**
   * Model property path to look up for specific postfix.
   * @type {string}
   */
  lookUp: 'compute.postfix',

  /**
   * Returns result of property computation.
   * @param {Object.<Fiber.Model>} model
   * @param {string} prop
   * @returns {*}
   */
  get: function(model, prop) {
    return $fn.computed.apply(model, prop, 'get');
  },

  /**
   * Sets computed property value.
   * @param {Object.<Fiber.Model>} model
   * @param {string} prop
   * @param {*} value
   * @param {?Object} [options]
   * @returns {*|{defaultPostfix, modelPostfix}}
   */
  set: function(model, prop, value, options) {
    return $fn.computed.apply(model, prop, 'set', [value], options);
  },

  /**
   * Determines if model has computed properties available for the given property
   * @param {Object.<Fiber.Model>} model
   * @param {string} prop
   * @param {string} action
   * @param {?string|Array} [match='any']
   * @returns {boolean}
   */
  has: function(model, prop, action, match) {
    return _[$valIncludes(match, 'some')]($castArr(action || ['get', 'set', 'has']), function(onePrefix) {
      return $isFn(model[$fn.computed.createMethodName(prop, onePrefix, model)]);
    });
  },

  /**
   * Applies property computation on the model.
   * @param {Object.<Fiber.Model>|Object} model
   * @param {string} prop
   * @param {string} action
   * @param {?Array} [args]
   * @param {?Object} [options]
   * @returns {*}
   */
  apply: function(model, prop, action, args, options) {
    options = $valMerge(options, { compute: true }, 'extend');
    var computedFn = $fn.class.resolveMethod(model, $fn.computed.createMethodName(prop, action, model))
      , nativeArgs = [$fn[action].bind(null, model.attributes || model._items || model), $fn.computed, $Ioc];
    if (! $isFn(computedFn)) return;
    var computedValue = computedFn.apply(model, $val(args, [], $isArr).concat(nativeArgs));
    if (action !== 'set') return computedValue;
    return model.set && model.set(prop, computedValue, options) || $set(model._items || model, prop, computedValue);
  },

  /**
   * Creates method name using action, postfix and property name
   * @param {string} prop
   * @param {?string} [action]
   * @param {?string|Object.<Fiber.Model>} [postfix]
   * @returns {string}
   */
  createMethodName: function(prop, action, postfix) {
    action = $val(action, '', $isStr);
    postfix = $fn.computed.getPostfix(postfix);
    prop = _.camelCase(prop);
    return (_.isEmpty(action) ? prop : action + _.upperFirst(prop)) + postfix;
  },

  /**
   * Returns postfix for the given model
   * @param {string|Object.<Fiber.Model>} [model]
   * @returns {string}
   */
  getPostfix: function(model) {
    var modelPostfix = $get(model, $fn.computed.lookUp, null);
    if (! (model instanceof Backbone.Model)) return $fn.computed.postfix;
    return $isStr(modelPostfix) ? modelPostfix : $fn.computed.postfix;
  },

  /**
   * Determines if given string is matching computed method name pattern.
   * @param {string} string
   * @returns {boolean}
   */
  isMethodName: function(string) {
    return $fn.regexp.test($fn.trim(string), '^(get|set|has)[a-zA-Z0-9]+' + this.postfix + '$');
  }
};
