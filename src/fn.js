// Fiber Class extend method.
// Some properties should not be overridden by extend, they should be merge, so we will
// search for them in given `proto` object and if one is found then we'll merge it with
// object `prototype` value
var extend = Fiber.fn.extend = function(proto, statics) {
  proto = Fiber.fn.assignApply(proto);
  statics = Fiber.fn.assignApply(statics);
  _.each(Fiber.globals.deepExtendProperties, function(one) {
    if (proto.hasOwnProperty(one)) {
      switch (true) {
        case _.isArray(proto[one]):
          proto[one] = proto[one].concat(this.prototype[one]);
          break;
        case _.isPlainObject(proto[one]):
          _.extend(proto[one], this.prototype[one]);
      }
    }
  }.bind(this));
  return classExtend.call(this, proto, statics);
};

// Extends `parent` with extender and statics with resolving extensions by `alias`
Fiber.make = function(parent, extender, statics) {
  return extend.call(
    val(parent, Fiber.Class),
    Fiber.getExtension(val(extender, {})),
    Fiber.getExtension(val(statics, {}))
  );
};

// Returns `value` if `value` is not undefined or null, otherwise returns defaults or `notDefined` value
var val = Fiber.fn.val = function(value, defaults, checker) {
  // if defaults not specified then assign notDefined `$__NULL__$` value
  defaults = arguments.length > 1 ? defaults : val.notDefined;
  // if value and checker is specified then use it to additionally check value
  if (_.isFunction(checker) && value != null) {
    // if checker returns true then we are good
    if (checker(value)) return value;
    // otherwise return defaults
    return defaults;
  }
  // if value not specified return defaults, otherwise return value;
  return value != null ? value : defaults;
};

// Value that can represent not defined state.
val.notDefined = '$__NULL__$';

// Apply `object` prototype `function` with given `args` and `context`
Fiber.fn.superCall = function(object, fn, args, context) {
  if (! object || ! object.prototype[fn] || ! _.isFunction(object[fn])) return;
  return object[fn].apply(context, args);
};

// Applies `assign` function with given `args`
Fiber.fn.assignApply = function(args) {
  if (_.isArray(args))
    return _.assign.apply(_, [{}].concat(args));
  return args;
};

// Template string
Fiber.fn.template = function() {
  return Fiber.globals.templateFunction.apply(arguments);
};

// Validates model
Fiber.fn.validate = function(model, attributes, options) {
  var rules = model.getRules(),
      errors = {},
      setError = function(key, err) {
        if (! errors[key]) errors[key] = [];
        errors[key].push(err);
      };

  attributes = attributes || model.attributes;

  if (_.isEmpty(rules)) return;

  for (var key in attributes) {
    var attribute = attributes[key],
        rule = rules[key],
        applyRule = true;

    if (! rule) continue;

    _.defaults(rule, {
      required: false,
      validators: [],
      when: null,
      message: null
    });

    if (_.isFunction(rule.when))
      applyRule = rule.when(model, attributes, options);
    else if (_.isBoolean(rule.when))
      applyRule = rule.when;

    if (! applyRule) continue;

    if (rule.required && (! _.isNumber(attribute) && _.isEmpty(attribute)))
      setError(key, 'Required attribute [' + key + '] is missing.');

    if (rule.validators) {
      var validators = [];

      if (_.isFunction(rule.validators)) validators.push(rule.validators);
      else if (_.isArray(rule.validators)) validators = rule.validators;
      else if (_.isString(rule.validators) && model[rule.validators])
        validators.push(model[rule.validators]);

      var matchEvery = _.every(validators, function(validator) {
        if (_.isFunction(validator))
          return validator(attribute, rule, options);
        else if (_.isBoolean(validator))
          return validator;
        return false;
      });

      if (! matchEvery) setError(key, rule.message ? rule.message : '[' + key + '] is not valid');
    }
  }

  if (! _.isEmpty(errors)) return errors;
};
