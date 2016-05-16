/***************************************************************************
 *
 * Fiber.js
 *
 * (c) 2016 Igor Krimerman <i.m.krimerman@gmail.com>
 *     Fiber may be freely distributed under the MIT license.
 *
 **************************************************************************/
;(function(factory) {
  // Fiber dependencies
  var deps = ['lodash', 'backbone', 'ractive', 'superagent']
  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
    , root = (typeof self == 'object' && self.self === self && self) ||
             (typeof global == 'object' && global.global === global && global);
  // Set up Fiber appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd)
    define(deps.concat('exports'), function(_, Backbone, Ractive, superagent, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Fiber.
      root.Fiber = factory(root, exports, Backbone, _, Ractive, superagent);
    });
  // Next for Node.js or CommonJS.
  else if (typeof exports !== 'undefined') factory.apply(null, [root, exports].concat(deps.map(function(dep) {
    return require(dep);
  })));
  // Finally, as a browser global.
  else root.Fiber = factory(root, {}, root.Backbone, root._, root.Ractive, root.superagent);

})(function(root, exports, Backbone, _, Ractive, superagent) {
  'use strict';
  /*eslint valid-jsdoc: 1*/
  // Register loading start
  console.time('Fiber:start');
  <!-- inject:js -->
  <!-- endinject -->
  // Register loading finished
  console.timeEnd('Fiber:start');
  return Fiber;
});
