var proxyfy = function(owner, length, method, attribute) {
  if (attribute) attribute = this[attribute];
  switch (length) {
    case 1:
      return function() {
        return owner[method](attribute);
      };
    case 2:
      return function(value) {
        return owner[method](attribute, value);
      };
    case 3:
      return function(iteratee, context) {
        return owner[method](attribute, iteratee, context);
      };
    case 4:
      return function(iteratee, defaultVal, context) {
        return owner[method](attribute, iteratee, defaultVal, context);
      };
    default:
      return function() {
        var args = slice.call(arguments);
        args.unshift(attribute);
        return owner[method].apply(owner, args);
      };
  }
};

var proxyOwnerMethods = function(Class, methods, attribute, owner) {
  owner = owner || _;
  _.each(methods, function(length, method) {
    var destruct = {name: method, len: length};
    if (_.isArray(length)) destruct = _.zipObject(length, ['name', 'len']);
    if (owner[method]) Class.prototype[destruct.name] = proxyfy(owner, destruct.len, method, attribute);
  });
};

var nativeMixins = {};

nativeMixins.Array = {};
nativeMixins.Object = {
  merge: 0,
  extend: 0,
  defaults: 0,
  defaultsDeep: 0,
  functions: 0,
  pick: 0,
  omit: 0,
  findKey: 1,
  pairs: 1,
  invert: 1,
  mapKeys: 2,
  transform: 3,
  valuesIn: ['values', 0],
  keysIn: ['keys', 0],
};
nativeMixins.String = {};
nativeMixins.Number = {};
nativeMixins.Function = {};
