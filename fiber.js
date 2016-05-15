/***************************************************************************
 *
 * Fiber.js
 *
 * (c) 2016 Igor Krimerman <i.m.krimerman@gmail.com>
 *     Fiber may be freely distributed under the MIT license.
 *
 **************************************************************************/
;(function(factory) {
  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self === self && self) ||
             (typeof global == 'object' && global.global === global && global);
  // Set up Fiber appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd)
    define(['lodash', 'backbone', 'exports'], function(_, Backbone, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Fiber.
      root.Fiber = factory(root, exports, Backbone, _);
    });
  // Next for Node.js or CommonJS. jQuery (or similar) may not be needed as a module.
  else if (typeof exports !== 'undefined') factory(root, exports, require('backbone'), require('lodash'));
  // Finally, as a browser global.
  else root.Fiber = factory(root, {}, root.Backbone, root._);

})(function(root, exports, Backbone, _) {
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
