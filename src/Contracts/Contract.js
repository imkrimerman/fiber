/**
 * Fiber Contract
 * @class
 */
Fiber.Contract = $fn.class.create({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  __signature: '[object Fiber.Contract]',

  /**
   * Contract immutability flag
   * @type {boolean}
   */
  __immutable: true,

  /**
   * Constructs contract
   * @param {string} name
   * @param {Object} contract
   */
  constructor: function(name, contract) {
    this.__name = '';
    this.__contract = {};
    this.setName(name);
    this.set(contract);
    if (this.__immutable) $fn.descriptor.immutable(this);
  },

  /**
   * Sets contract object
   * @param {Object} contract
   */
  set: function(contract) {
    if (this.__isValid(contract)) this.__contract = contract;
    return this;
  },

  /**
   * Returns contract object
   * @returns {Object}
   */
  get: function() {
    return this.__contract;
  },

  /**
   * Determines if given object matches the Contract
   * @param {Object} object
   * @returns {boolean}
   */
  isImplementedBy: function(object, fn) {
    fn = $val(fn, 'every', $fn.createIncludes(['every', 'some', 'any']));
    var source = object.prototype || object;
    return _[fn](this.get(), function(type, property) {
      var value = _.get(source, property, $val.notDefined);
      return $TypeChecker.matches(value, type);
    });
  },

  /**
   * Sets contract name
   * @param {string} name
   * @returns {Fiber.Contract}
   */
  setName: function(name) {
    if (_.isString(name)) this.__name = name;
    return this;
  },

  /**
   * Returns contract name
   * @returns {string}
   */
  getName: function() {
    return this.__name;
  },

  /**
   * Determines if contract is immutable
   * @returns {boolean}
   */
  isImmutable: function() {
    return this.__immutable;
  },

  /**
   * Determines if given contract is valid
   * @param {Object|*} contract
   * @returns {boolean}
   * @private
   */
  __isValid: function(contract) {
    return _.isPlainObject(contract) && _.every(_.values(contract), _.isString);
  },
});

/**
 * Add Contract type to Fiber
 */
Fiber.Types.Contract = new Fiber.Type({
  type: 'object',
  signature: Fiber.Contract.prototype.__signature,
  defaults: Fiber.Contract
});
