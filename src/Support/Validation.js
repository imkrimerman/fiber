/**
 * Fiber Validation support
 * @var {Object}
 */
Fiber.fn.validation = {

  /**
   * Rule defaults
   * @var {Object}
   */
  ruleDefaults: {
    required: false,
    match: 'every', // some
    validators: [],
    when: null,
    message: null
  },

  /**
   * Validates model
   * @param {Object.<Fiber.Model>} model - Model to validate/use
   * @param {?Object} [attributes] - Attributes to validate (default: Model attributes)
   * @param {?Object} [options] - Options object {showErrors: {boolean}}
   * @returns {void|Object}
   */
  validate: function(model, attributes, options) {
    // flush error bag after last validation
    model.errorBag.flush();
    var rules = model.getRules();
    // if model doesn't have any rules, then we are okey to return true
    if (_.isEmpty(rules)) return true;
    // otherwise ensure arguments have default values
    options = val(options, {});
    attributes = val(attributes, model.attributes);
    // If attributes are empty, then we are okey to return true
    if (_.isEmpty(attributes)) return true;

    // traverse through attributes
    for (var key in attributes) {
      var attribute = attributes[key]
        , rule = rules[key]
        , applyRule = true;

      // no rule for current attribute, then we are okey to return true
      if (! rule) return true;
      // ensure that rule has all default properties
      rule = this.ensureRuleDefaults(rule);
      // Check if `when` rule condition is function and if so, then call it with the arguments
      if (_.isFunction(rule.when)) applyRule = rule.when(model, attribute, options);
      // If result of `when` rule condition is true then we can proceed, otherwise we'll return true
      if (! applyRule) return true;

      // if attribute is required and it's empty and not a number (0 can be treated as false),
      if (rule.required && (! _.isNumber(attribute) && _.isEmpty(attribute)))
      // then we'll add error to model's error bag
        model.errorBag.push(key, 'Required attribute [' + key + '] is missing.');

      // Also if we have rule validators, then continue validating with them.
      if (rule.validators) {
        var validators = [];

        // If validator is function, then simply push it to validators array
        if (_.isFunction(rule.validators)) validators.push(rule.validators);
        // If is array, then concatenate
        else if (_.isArray(rule.validators)) validators = rule.validators;
        // And If is string, then try to resolve validation method from model
        else if (_.isString(rule.validators) && model[rule.validators])
          validators.push(Fiber.fn.class.resolveMethod(model, rule.validators));

        // validation runner to support recursive validators grouping
        var runValidation = function(validators) {
          return _[rule.match](validators, function(validator) {
            if (_.isString(validator)) validator = Fiber.fn.class.resolveMethod(model, validator);
            if (_.isFunction(validator)) return validator(attribute, rule, model, options);
            if (_.isArray(validator)) return runValidation(validator);
            return false;
          });
        };

        // After validators are prepared lets traverse them and call each with attribute.
        var matched = runValidation(validators);

        // If true is returned from each validator, then we can say that attribute is valid.
        // Otherwise add errors to the models error bag.
        if (! matched) model.errorBag.push(key, rule.message ? rule.message : '[' + key + '] is not valid');
      }
    }
    // if showErrors is enabled then let's return them
    if (options.showErrors) return model.errorBag.getErrors();
    // otherwise lets return boolean result of validation
    return model.errorBag.hasErrors();
  },

  /**
   * Validates `attributes` hash with given `rules`
   * @param {Object} attributes - Attributes to validate
   * @param {Object} rules - Rules to use
   * @param {?Object} [options] - Options object
   * @returns {*|void|Object}
   * @memberof Fiber.fn.validation#
   */
  validateAttributes: function(attributes, rules, options) {
    // Create new Fiber.Model with given rules
    var model = new Fiber.Model(attributes, {rules: rules});
    // return validation result
    return this.validate(model, null, options);
  },

  /**
   * Ensures that rule has default attributes
   * @param {Object} rule - Rule to ensure
   * @returns {Object}
   * @memberof Fiber.fn.validation#
   */
  ensureRuleDefaults: function(rule) {
    return _.defaults(val(rule, {}), this.ruleDefaults);
  }
};
