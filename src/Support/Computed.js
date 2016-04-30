/**
 * Computed Properties support
 * @type {Object}
 */
Fiber.fn.computed = {

  /**
   * Computed accessor/mutator function postfix
   * @type {string}
   */
  postfix: $Const.computed.defaultPostfix,

  /**
   * Returns result of property computation
   * @param {Object.<Fiber.Model>} model
   * @param {string} prop
   * @returns {*}
   */
  get: function(model, prop) {
    var privateCompute = model[$Const.computed.private];
    if (privateCompute && _.has(privateCompute, prop))
    return $fn.computed.apply(model, prop, 'get');
  },

  /**
   * Sets computed property value
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
    match = $val(match, 'any', $fn.createIncludes(['any', 'every']));
    return _[match]($fn.castArr(action), function(onePrefix) {
      var computedKey = $fn.computed.createMethodName(prop, onePrefix, model);
      if (_.isFunction(model[computedKey])) return true;
      return false;
    });
  },

  /**
   * Applies property computation on the model
   * @param {Object.<Fiber.Model>} model
   * @param {string} prop
   * @param {string} action
   * @param {?Array} [args]
   * @param {?Object} [options]
   * @returns {*}
   */
  apply: function(model, prop, action, args, options) {
    options = $valMerge(options, {denyCompute: true}, 'extend');
    var computedFn = $fn.class.resolveMethod(model, $fn.computed.createMethodName(prop, action, model))
      , nativeArgs = [model.__super__[action].bind(model), $fn.computed, Fiber.container];
    if (! _.isFunction(computedFn)) return;
    var computedValue = computedFn.apply(model, $val(args, [], _.isArray).concat(nativeArgs));
    return action === 'set' && model.set(prop, computedValue, options) || computedValue;
  },

  /**
   * Creates method name using action, postfix and property name
   * @param {string} prop
   * @param {?string} [action]
   * @param {?string|Object.<Fiber.Model>} [postfix]
   * @returns {string}
   */
  createMethodName: function(prop, action, postfix) {
    action = $val(action, '', _.isString);
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
    if (! (model instanceof Backbone.Model)) return $fn.computed.postfix;
    var modelPostfix = _.get(model, $Const.computed.modelPostfix, $fn.computed.postfix);
    return _.isString(modelPostfix) ? modelPostfix : $fn.computed.postfix;
  },
};
