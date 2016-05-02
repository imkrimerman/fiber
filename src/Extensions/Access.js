/**
 * Access extension brings getters, setters and unsetters that uses
 * `lodash` methods to support deep access to the Class.
 * @type {Object.<Fiber.Extension>}
 */
var $Access = new Fiber.Extension('Access', $fn.delegator.delegateForThis({}, $fn.access));

/**
 * Register Extension
 */
$Ioc.extension('Access', $Access);

/**
 * Add access mixin to the Fiber
 */
$Access.includeTo(Fiber);
