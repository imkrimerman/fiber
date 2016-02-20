// Fiber.js
//
// (c) 2015-2016 Igor Krimerman <i.m.krimerman@gmail.com>
//     Fiber may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://familydev.in.ua/hub/fiber

;(function(factory) {
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
  }
  // Next for Node.js or CommonJS. jQuery (or similar) may not be needed as a module.
  else if (typeof exports !== 'undefined') {
    var _ = require('lodash'), Backbone = require('backbone');
    factory(root, exports, Backbone, _);
  }
  // Finally, as a browser global.
  else root.Fiber = factory(root, {}, root.Backbone, root._);

})(function(root, exports, Backbone, _) {
  'use strict';
  /*eslint valid-jsdoc: 1*/

  /**
   * Fiber main object
   * @type {Object}
   */
  var Fiber = exports;

  /**
   * Save the previous value of the `Fiber` variable, so that it can be
   * restored later on, if `noConflict` is used.
   */
  var prevFiber = root.Fiber;

  /**
   * Runs Fiber.js in `noConflict` mode, returning the `Fiber` variable
   * to its previous owner. Returns a reference to this Fiber object.
   * @returns {Fiber}
   */
  Fiber.noConflict = function() {
    root.Fiber = prevFiber;
    return this;
  };

  /**
   * Exposed jQuery (or similar) from Backbone
   * @type {Function}
   */
  var $ = Fiber.$ = Backbone.$;

  /**
   * Add `lodash` to the Fiber
   * @type {Function}
   */
  Fiber._ = _;

  /**
   * Fiber Version
   * @type {string}
   */
  Fiber.VERSION = '0.0.10';

  /**
   * Fiber global variables
   * @var {Object}
   */
  Fiber.globals = {};

  /**
   * Fiber extensions holder.
   * Extensions in Fiber are like mixins or common code that you can
   * share over the Instances.
   * @var {Object}
   */
  Fiber.Extensions = {};

  <!-- inject:js -->
  <!-- endinject -->
  return Fiber;
});
