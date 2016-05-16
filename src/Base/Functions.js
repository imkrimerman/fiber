/**
 * Gets value by given `path` key. You can provide `defaults` value that
 * will be returned if value is not found by the given key. If `defaults` is
 * not provided then `null` will be returned.
 * @param {Object} object
 * @param {string} path
 * @param {*} [defaults]
 * @returns {*}
 */
var $get = function(object, path, defaults) {
  if (! _.isArray(path)) return _.get(object, path, defaults);
  return _.map(path, function(prop) {
    return $get(object, prop);
  });
};

/**
 * Sets `value` by given `path` key.
 * @param {Object} object
 * @param {string} path
 * @param {*} value
 * @returns {Object}
 */
var $set = function(object, path, value) {
  var isArr = _.isArray(object);
  if (_.isPlainObject(path)) {
    if (! isArr) _.extend(object, path);
    else object.push.apply(object, _.values(path));
  }
  if (! _.isArray(path)) _.set(object, path, value);
  else {
    var isValueArray = _.isArray(value);
    $each(path, function(prop, index) {
      $set(object, prop, isValueArray ? value[index] : value);
    });
  }
  return object;
};

/**
 * Determine if `object` has given `path`.
 * @param {Object} object
 * @param {string} path
 * @param {string} [match]
 * @returns {boolean}
 */
var $has = function(object, path, match) {
  if (! _.isArray(path)) return _.has(object, path);
  var fn = _.isString(match) ? match : 'every';
  return _[fn](path, function(prop) {
    return $has(object, prop);
  });
};

/**
 * Gets value by the given `path` key, if `path` value is function then it will be called.
 * You can provide `defaults` value that will be returned if value is not found
 * by the given key. If `defaults` is not provided that defaults will be set to `null`.
 * @param {Object|function(...args)} object
 * @param {string} path
 * @param {*} [defaults]
 * @returns {*}
 */
var $result = function(object, path, defaults) {
  if (! _.isArray(path) && ! _.isObject(object)) return object;
  if (_.isFunction(object)) return object(path, defaults, object);
  return _.map($castArr(path), function(prop) {
    return _.result(object, prop, defaults);
  });
};

/**
 * Removes `value` by the given `path` key.
 * @param {Object} object
 * @param {string} path
 * @returns {Object}
 */
var $forget = function(object, path) {
  if (! _.isArray(path)) _.unset(object, path);
  else $each(path, function(prop) {
    $forget(object, prop);
  });
  return object;
};

/**
 * A no-operation function that returns undefined regardless of the arguments it receives.
 * @returns {void}
 */
var $noop = function() {};

/**
 * The bind function is an addition to ECMA-262, 5th edition; as such it may not be present in all browsers.
 * You can partially work around this by inserting the following code at the beginning of your scripts,
 * allowing use of much of the functionality of bind() in implementations that do not natively support it.
 * @param {Object} scope
 * @param {...args}
 * @returns {function(...)}
 */
var $bind = function(scope) {
  if (typeof this !== 'function') throw new TypeError('`Function.bind` >> Caller is not callable.');
  var slice = Array.prototype.slice
    , partials = slice.call(arguments, 1)
    , args = partials.concat(slice.call(arguments))
    , fnToBind = this
    , bound = function() {
    return fnToBind.apply(this instanceof $noop && scope ? this : scope, args);
  };

  $noop.prototype = this.prototype;
  bound.prototype = new $noop();
  return bound;
};

/**
 * Casts given object to Array
 * @param {*} object
 * @returns {Array}
 */
var $castArr = function(object) {
  if (_.isArray(object)) return object;
  if (_.isArguments(object)) return Array.prototype.slice.call(object);
  return [object];
}

/**
 * Returns Xhr
 * @return {XMLHttpRequest|ActiveXObject}
 */
var $getXhr = function() {
  try { return new (root.XMLHttpRequest || ActiveXObject); }
  catch (e) { $log.error('Xhr is unavailable in current browser.'); }
};
