Fiber.fn.computed = {

  postfix: $Const.computed.defaultPostfix,

  get: function(model, attribute) {
    return $fn.computed.apply(model, attribute, 'get');
  },

  set: function(model, attribute, value) {
    return $fn.computed.apply(model, attribute, 'set', [value]);
  },

  has: function(model, attribute, prefix, match) {
    match = $val(match, 'any', $fn.createIncludes(['any', 'every']));
    return _[match]($fn.castArr(prefix), function(onePrefix) {
      var computedKey = $fn.computed.createName(attribute, onePrefix, model);
      if (_.isFunction(model[computedKey])) return true;
      return false;
    });
  },

  apply: function(model, attribute, prefix, args) {
    var computed = $fn.class.resolveMethod(model, $fn.computed.createName(attribute, prefix, model));
    if (_.isFunction(computed)) return computed.apply(this, $val(args, []));
    return void 0;
  },

  createName: function(attribute, prefix, postfix) {
    if (postfix instanceof Backbone.Model) postfix = $fn.computed.getPostfix(postfix);
    prefix = $val(prefix, '', _.isString);
    postfix = $val(postfix, $fn.computed.postfix, _.isString);
    attribute = _.camelCase(attribute);
    prefix = ! _.isEmpty(prefix) ? prefix + _.capitalize(attribute) : attribute;
    return prefix + postfix;
  },

  getPostfix: function(model) {
    return _.get(model, $Const.computed.modelPostfix, $fn.computed.postfix);
  },
};
