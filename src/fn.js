// Fiber Class extend method.
// Some properties should not be overridden by extend, they should be merge, so we will
// search for them in given `proto` object and if one is found then we'll merge it with
// object `prototype` value
var extend = Fiber.fn.extend = function(proto, statics) {
  proto = Fiber.fn.assignApply(proto);
  statics = Fiber.fn.assignApply(statics);
  _.each(Fiber.globals.deepExtendProperties, function(one) {
    if (proto.hasOwnProperty(one) && this.prototype[one]) {
      switch (true) {
        case _.isArray(proto[one]):
          proto[one] = this.prototype[one].concat(proto[one]);
          break;
        case _.isPlainObject(proto[one]):
          _.extend(proto[one], this.prototype[one]);
      }
    }
  }.bind(this));
  return Backbone.Model.extend.call(this, proto, statics);
};

// Extends `parent` using extender and statics with resolving extensions by `alias`
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
Fiber.fn.apply = function(object, fn, args, context) {
  if (! object || ! object.prototype[fn] || ! _.isFunction(object.prototype[fn]))
    return;
  context = context || this;
  return object.prototype[fn].apply(context, args);
};

// Applies `assign` function with given `args`
Fiber.fn.assignApply = function(args) {
  if (_.isArray(args))
    return _.assign.apply(_, [{}].concat(args));
  return args;
};

// Template string
Fiber.fn.template = function() {
  var renderFn = Fiber.globals.templateFunction;
  if (! renderFn) return _.constant(arguments[0]);
  return renderFn.apply(renderFn, arguments);
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

// Adds given `mixin` to the `object`. Mixin can be object or function.
// Also you can provide `override` boolean to force override properties.
Fiber.fn.mix = function(object, mixin, override) {
  override = val(override, false);
  // If function is given then it will be called with current Class.
  if (_.isFunction(mixin)) {
    mixin(object);
    return this;
  }
  var method = 'defaultsDeep';
  if (override) method = 'assign';
  _[method](object, mixin);
  return object;
};

// Includes `mixin` or array of mixins to the `object`.
// Also you can provide `override` boolean to force override properties.
Fiber.fn.include = function(object, mixin, override) {
  if (! _.isArray(mixin) && _.isPlainObject(mixin))
    Fiber.fn.mix(object, mixin, override);
  else for (var i = 0; i < mixin.length; i ++)
    Fiber.fn.mix(object, mixin[i], override);
  return this;
};
