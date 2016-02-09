// Fiber.js
//
// (c) 2015-2016 Igor Krimerman <i.m.krimerman@gmail.com>
//     Fiber may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://familydev.in.ua/hub/fiber

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self === self && self) ||
             (typeof global == 'object' && global.global === global && global);

  // Set up Fiber appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'backbone', 'exports'], function(_, Backbone, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Fiber.
      root.Fiber = factory(root, exports, Backbone, _);
    });

    // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  }
  else if (typeof exports !== 'undefined') {
    var _ = require('lodash'), Backbone = require('backbone');
    factory(root, exports, Backbone, _);

    // Finally, as a browser global.
  }
  else {
    root.Fiber = factory(root, {}, root.Backbone, root._);
  }

})(function(root, Fiber, Backbone, _) {
  'use strict';

  // Add more room for support functions
  Fiber.fn = {};

  // Also we'll create object to hold all global variables
  Fiber.globals = {
    version: '0.0.5',
    deepExtendProperties: ['hidden', 'extendable', 'ownProps', 'extensions', 'events', 'eventsCatalog'],
    templateFunction: _.template
  };

  // Fiber extensions holder.
  // Extensions in Fiber are like mixins or common code that you can
  // share over the Instances.
  Fiber.Extension = {};

  // Expose jQuery from Backbone
  var $ = Fiber.$ = Backbone.$;

  // Add `lodash` to the Fiber
  Fiber._ = _;

  // Class extend function grabbed from the Backbone.
  var classExtend = Backbone.Model.extend;

  <!-- inject:js -->
  <!-- endinject -->

  return Fiber;
});
