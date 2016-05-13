/**
 * Fiber Contract
 * @class
 * @extends {BaseClass}
 */
Fiber.Contract = BaseClass.extend({

  /**
   * Class type signature
   * @type {string}
   * @private
   */
  _signature: '[object Fiber.Contract]',

  /**
   * Contract immutability flag
   * @type {boolean}
   */
  _immutable: true,

  /**
   * Constructs contract
   * @param {string} name
   * @param {Object} contract
   */
  constructor: function(name, contract) {
    this._name = '';
    this._contract = {};
    this.setName(name);
    this.set(contract);
    if (this._immutable) $fn.descriptor.immutable(this);
  },

  /**
   * Sets contract object
   * @param {Object} contract
   */
  set: function(contract) {
    if (this._isValid(contract)) this._contract = contract;
    return this;
  },

  /**
   * Returns contract object
   * @returns {Object}
   */
  get: function() {
    return this._contract;
  },

  /**
   * Determines if given object matches the Contract
   * @param {Object} object
   * @param {string} [fn='every']
   * @returns {boolean}
   */
  isImplementedBy: function(object, fn) {
    return $fn.class.isImplementing(object, this, fn);
  },

  /**
   * Sets contract name
   * @param {string} name
   * @returns {Fiber.Contract}
   */
  setName: function(name) {
    if (_.isString(name)) this._name = name;
    return this;
  },

  /**
   * Returns contract name
   * @returns {string}
   */
  getName: function() {
    return this._name;
  },

  /**
   * Determines if contract is immutable
   * @returns {boolean}
   */
  isImmutable: function() {
    return this._immutable;
  },

  /**
   * Determines if given contract is valid
   * @param {Object|*} contract
   * @returns {boolean}
   * @private
   */
  _isValid: function(contract) {
    return _.isPlainObject(contract) && _.every(_.values(contract), function(value) {
      return value instanceof Fiber.Type || _.isPlainObject(value);
    });
  },
});

/**
 * Add Contract type to Fiber
 */
Fiber.Types.Contract = new Fiber.Type({
  type: 'object',
  signature: Fiber.Contract.prototype._signature,
  defaults: Fiber.Contract
});
