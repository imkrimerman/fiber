/**
 * Fiber Storage
 * @class
 */
Fiber.Storage = function(storable) {
  this._storage = $val(storable, {}, _.isPlainObject);
};

/**
 * Creates prototype access methods for Private storage.
 */
$each(['get', 'set', 'has', 'forget', 'result'], function(fn) {
  if (fn === 'set') $Storage.prototype[fn] = function(key, value) {
    if (! $fn.has(this._storage, key)) return $fn.set(this._storage, key, value);
    var retrieved = $fn.get(this._storage, key);
    if (! retrieved) retrieved = $fn.types && $fn.types.what(value).getExample() || _.isArray(value) ? [] : {};
    $fn.set(this._storage, key, $fn.merge(retrieved, value));
    return this;
  };
  else $Storage.prototype[fn] = function() {
    return $fn.applyFn($fn[fn], $fn.argsConcat(this._storage, arguments));
  };
});
