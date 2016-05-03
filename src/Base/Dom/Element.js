var domSupport = $fn.clone($dom, true)
  , omitDelegationToThisMethods = ['$', 'create', 'createClass', 'isReady', 'ready'];

/**
 * Fiber Dom Element
 * @class
 * @extends {Fiber.Class}
 */
$DomElement = Fiber.DomElement = Fiber.Class.extend([
  _.pick(domSupport, omitDelegationToThisMethods),
  $fn.delegator.proxyMixin({}, _.omit(domSupport, omitDelegationToThisMethods)), {
    constructor: function(selector, scope) {
      this.selector = $val(selector, null, [_.negate(_.isEmpty), _.isArray], 'any');
      this.scope = $val(scope, $doc);
      this.node = null;
      if (this.selector) this.node = this.find(this.selector, this.scope);
    },
  }
]);

/**
 * Migrate DomElement prototype to `$` function to make instanceof calls working
 */
_.extend($fn.dom.$.prototype, Fiber.DomElement.prototype);
