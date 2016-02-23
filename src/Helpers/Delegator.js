Fiber.fn.delegator = {

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

  proxyfier: function(owner, method, attribute, argLength) {
    argLength = val(argLength, false, _.isNumber);
    return function() {
      attribute = val(attribute, this);
      if (_.isString(attribute)) attribute = this[attribute];

      var args = _.drop(arguments);
      if (argLength) args = _.take(args, argLength);

      return owner[method].apply(owner, [attribute].concat(args));
    };
  },

  delegate: function(Class, methods, attribute, owner) {
    owner = owner || _;
    _.each(methods, _.bind(function(length, method) {
      var destruct = { name: method, len: length };
      if (_.isArray(length)) destruct = _.zipObject(['name', 'len'], length);
      if (owner[method])
        Class.prototype[destruct.name] = this.proxyfier(owner, method, attribute, destruct.len);
    }, this));
    return this;
  },

  delegateMixin: function(Class, mixin, attribute, owner) {
    mixin = this.getMixin(mixin);
    if (_.isPlainObject(mixin)) this.delegate(Class, mixin, attribute, owner);
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
};
