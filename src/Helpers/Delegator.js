Fiber.fn.delegator = {

  /**
   * Proxies function
   * @param {Function} fn
   * @param {?Object} [scope=fn]
   * @returns {Function}
   */
  proxy: function(fn, scope) {
    scope = val(scope, fn);
    return function() {
      var args = _.toArray(arguments);
      return fn.apply(scope, [this].concat(args));
    };
  },

  strictProxy: function(owner, method, attribute, argLength) {
    argLength = val(argLength, false, _.isNumber);

    return function() {
      var args = _.drop(arguments);
      if (_.isString(attribute)) attribute = this[attribute];
      else attribute = val(attribute, this);
      if (argLength) args = _.take(args, argLength);
      return owner[method].apply(owner, [attribute].concat(args));
    };
  },

  delegator: function(Class, methods, attribute, owner) {
    owner = owner || _;
    _.each(methods, _.bind(function(length, method) {
      var destruct = { name: method, len: length };
      if (_.isArray(length)) destruct = _.zipObject(['name', 'len'], length);
      if (owner[method])
        Class.prototype[destruct.name] = this.strictProxy(owner, method, attribute, destruct.len);
    }, this));
    return this;
  },

  mixin: function(Class, mixin, attribute, owner) {
    mixin = this.getMixin(mixin);
    if (_.isPlainObject(mixin)) this.delegator(Class, mixin, attribute, owner);
    return this;
  },

  mixinList: function(mixin) {
    mixin = this.getMixin(mixin);
    if (_.isPlainObject(mixin)) return _.keys(mixin);
    return [];
  },

  getMixin: function(mixin, defaults) {
    return this.mixins[mixin] || val(defaults, null);
  },

  mixins: {
    object: {
      merge: 0,
      extend: 0,
      defaults: 0,
      defaultsDeep: 0,
      functions: 0,
      functionsIn: 0,
      pick: 0,
      omit: 0,
      findKey: 1,
      invert: 1,
      mapKeys: 2,
      transform: 3,
      values: 0,
      valuesIn: 0,
      keys: 0,
      keysIn: 0,
    }
  },
};
