/**
 * Fiber Validation support
 * @type {Object}
 */
Fiber.fn.validation = {

  /**
   * Default validation rule
   * @type {Object}
   */
  rule: {

    /**
     * Rule required flag
     * @type {boolean|Function}
     */
    required: false,

    /**
     * Logical match comparator.
     * Available comparators: every, some, any
     * @type {string}
     */
    match: 'every',

    /**
     * Rule validators
     * @type {Array|Object|Function|string}
     */
    validators: [],

    /**
     * Logical middleware before validation
     * @type {Function|null}
     */
    when: null,

    /**
     * Flag to enable/disable events triggering on model during validation
     * @type {boolean|Function}
     */
    silent: false,

    /**
     * Messages container.
     * @type {Object}
     */
    messages: {

      /**
       * Preserve rule messages to be pushed to error bag.
       * @type {boolean}
       */
      preserve: false,

      /**
       * `Attribute required` message.
       * @type {string|Function}
       */
      required: 'Required attribute [{{= attribute }}] is missing.',

      /**
       * Single validation message for all validators.
       * Will be used if validators type is not plain object.
       * @type {string|Function}
       */
      single: 'Attribute [{{= attribute }}] is not valid.',

      /**
       * Hash map of validation messages.
       * To use messages hash you need to set validators property as plain object and
       * give each validator function an alias (object key), then you can use same alias
       * to add specific error message for each validator.
       * @type {Object|Function}
       */
      hash: {}
    },
  },

  /**
   * Map of message types
   * @type {Object}
   */
  messageTypes: {
    required: 'REQUIRED',
    validator: 'VALIDATOR'
  },

  /**
   * Validates model
   * @param {Object.<Fiber.Model>} model - Model to validate/use
   * @param {?Object} [attributes] - Attributes to validate (default: Model attributes)
   * @param {?Object} [options] - Options object {showErrors: {boolean}}
   * @returns {void|Object}
   */
  validate: function(model, attributes, options) {
    var $validate = $fn.validation
      , rules = $validate.getRules(model);
    // if model doesn't have any rules, then we are okey to return true
    if (_.isEmpty(rules)) return true;
    // otherwise ensure arguments have default values
    options = $val(options, {}, _.isPlainObject);
    attributes = $val(attributes, model.attributes || model, _.isPlainObject);
    // If attributes are empty, then we are okey to return true
    if (_.isEmpty(attributes)) return true;
    model.fire('validating', rules, model, options);
    // flush error bag after last validation
    model.errorBag.flush();
    // traverse through all attributes rules
    for (var attribute in rules) {
      var attributeValue = attributes[attribute]
        , rule = rules[attribute]
        , isPreserved = _.result(rule, 'messages.preserve', false)
        , applyRule = true;
      // no rule for current attribute, then we are okey to return true
      if (! rule) return true;
      // ensure that rule has all default properties
      rule = this.ensureRuleDefaults(rule);
      // Check if `when` rule condition is function and if so, then call it with the arguments
      if (_.isFunction(rule.when)) applyRule = rule.when(model, attributeValue, options);
      // If result of `when` rule condition is true then we can proceed, otherwise we'll return true
      if (! applyRule) return true;
      // if attribute is required and it's empty and not a number (0 can be treated as false),
      if (rule.required && (! _.isNumber(attributeValue) && _.isEmpty(attributeValue))) {
        // then we'll add error to model's error bag
        if (! isPreserved) $validate.addMessage(model, attribute, rule, this.messageTypes.required);
      }
      // Also if we have rule validators, then continue validating with them.
      if (rule.validators) {
        var validators = [];
        // If validator is function, then simply push it to validators array
        if (_.isFunction(rule.validators)) validators.push(rule.validators);
        // If is array, then concatenate
        else if (_.isArray(rule.validators)) validators = rule.validators;
        // And If is string, then try to resolve validation method from model
        else if (_.isString(rule.validators) && _.has(model, rule.validators))
          validators.push($fn.class.resolveMethod(model, rule.validators));
        // validation runner to support recursive validators grouping
        var runValidation = function(validators) {
          return _[rule.match](validators, function(validator) {
            $fn.fireAttribute(model, 'validating:attribute', attribute, [validator, model, options]);
            var result = false;
            if (_.isString(validator)) validator = $fn.class.resolveMethod(model, validator);
            if (_.isFunction(validator)) result = validator(attributeValue, rule, model, options);
            else if (_.isArray(validator)) result = runValidation(validator);
            $fn.fireAttribute(model, 'validated:attribute', attribute, [result, validator, model, options]);
            return result;
          });
        };
        // After validators are prepared lets traverse them and call each with attribute.
        var matched = runValidation(validators);
        // If true is returned from each validator, then we can say that attribute is valid.
        // Otherwise add errors to the models error bag.
        if (! matched && ! isPreserved) $validate.addMessage(model, attribute, rule, this.messageTypes.validator);
      }
    }
    model.fire('validated', model.errorBag.hasErrors(), rules, model, options);
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
   * Adds validation message to the model
   * @param {Object.<Fiber.Model>} model
   * @param {string} attribute
   * @param {Object} rule
   * @param {string} type
   * @returns {string}
   */
  addMessage: function(model, attribute, rule, type) {
    var isModel = model instanceof Fiber.Model
      , property = isModel && model.errorBag || model[$Const.validation.messages]
      , isErrorBag = property instanceof Fiber.ErrorBag
      , scope = {attribute: attribute, model: model, rule: rule, type: type}
      , message = $fn.validation.getCompiledMessageByType(rule, type, scope);

    if (! isErrorBag) property = new Fiber.ErrorBag();
    property.push(attribute, message);

    return message;
  },

  /**
   * Returns message for the given rule or the default one
   * @param {string} rule
   * @param {string} attribute
   * @param {?string} [defaults]
   * @param {?boolean} [customPath] - create get key using attribute and ignoring path constructing
   * @returns {*}
   */
  getMessage: function(rule, attribute, defaults, customPath) {
    customPath = $val(customPath, false);
    defaults = $val(defaults, $fn.template.compile(this.rule.messages.single, {attribute: attribute}));
    var isHash = $fn.validation.isHashMessageNeeded(rule)
      , key = $fn.validation.getPathByRule(rule)
      , message = _.result(rule, (customPath ? attribute : key), defaults);
    if (customPath) return message;
    if (_.isEmpty(message)) return defaults;
    return isHash && $isDef(attribute) ? _.result(message, attribute, defaults) : message;
  },

  /**
   * Returns compiled ruled message
   * @param {string} rule
   * @param {string} attribute
   * @param {?Object} [scope={}]
   * @param {?boolean} [customPath]
   * @returns {string}
   */
  getCompiledMessage: function(rule, attribute, scope, customPath) {
    var message = $fn.validation.getMessage(rule, attribute, null, customPath);
    if (! message) return '';
    return $fn.template.compile(message, $fn.template.imports(scope));
  },

  /**
   * Returns rule message by `type` for `attribute`
   * @param {string} rule
   * @param {string} type
   * @param {?Object} [scope={}]
   * @returns {string}
   */
  getCompiledMessageByType: function(rule, type, scope) {
    var isRequiredType = type === this.messageTypes.required
      , path = isRequiredType ? 'messages.required' : $fn.validation.getPathByRule(rule);
    if (scope.attribute) path += '.' + scope.attribute;
    return $fn.validation.getCompiledMessage(rule, path, scope, true);
  },

  /**
   * Returns model rules or defaults
   * @param {Object.<Fiber.Model>|Object} model
   * @param {?Object} [defaults]
   * @returns {Object}
   */
  getRules: function(model, defaults) {
    var rules = {};
    if (_.isFunction(model.getRules)) rules = model.getRules();
    else if (model.rules) rules = model.rules;
    if ($isDef(defaults) && _.isEmpty(rules)) return defaults;
    return rules;
  },

  /**
   * Ensures that rule has default attributes
   * @param {Object} rule - Rule to ensure
   * @returns {Object}
   * @memberof Fiber.fn.validation#
   */
  ensureRuleDefaults: function(rule) {
    return _.defaults($val(rule, {}), this.rule);
  },

  /**
   * Creates path using rule
   * @param {Object} rule
   * @returns {string}
   */
  getPathByRule: function(rule) {
    return 'messages.' +  ($fn.validation.isHashMessageNeeded(rule) ? 'hash' : 'single');
  },

  /**
   * Determine if key for messages will be for single message
   * @param {Object} rule
   * @returns {boolean}
   */
  isSingleMessageNeeded: function(rule) {
    return ! $fn.validation.isHashMessageNeeded(rule);
  },

  /**
   * Determine if key for messages will be for hash message object
   * @param {Object} rule
   * @returns {boolean}
   */
  isHashMessageNeeded: function(rule) {
    return _.isPlainObject(_.result(rule, 'validators'));
  },
};
