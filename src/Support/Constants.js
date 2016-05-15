/**
 * Constants private storage
 * @type {Object}
 */
$ConstantsStorage = {};

/**
 * Fiber Constants
 * @type {Object}
 */
Fiber.Constants = {};

/**
 * Creates access methods for Constants.
 */
$each(['get', 'set', 'has', 'forget'], function(fn) {
  if (fn === 'set') Fiber.Constants[fn] = function(key, value) {
    var hasKey = $fn.has($ConstantsStorage, key);
    if (! hasKey) return $fn.set($ConstantsStorage, key, value);
    var retrieved = $fn.get($ConstantsStorage, key);
    if (! retrieved) retrieved = $fn.types.what(value)
  };
  else Fiber.Constants[fn] = $fn[fn].bind(Fiber.Constants, $ConstantsStorage);
});
