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
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'jquery', 'backbone', 'exports'], function(_, $, Backbone, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Fiber.
      root.Fiber = factory(root, exports, Backbone, _, $);
    });
  }
  // Next for Node.js or CommonJS. jQuery (or similar) may not be needed as a module.
  else if (typeof exports !== 'undefined') {
    var _ = require('lodash'), $ = require('jquery'), Backbone = require('backbone');
    factory(root, exports, Backbone, _, $);
  }
  // Finally, as a browser global.
  else root.Fiber = factory(root, {}, root.Backbone, root._, root.$);

})(function(root, exports, Backbone, _, $) {
  'use strict';
  /*eslint valid-jsdoc: 1*/

  /**
   * Native JS objects prototypes
   * @type {Object}
   * @private
   */
  var js = {
    arr: Array.prototype,
    obj: Object.prototype
  };

  /**
   * Fiber main object
   * @type {Object}
   */
  var Fiber = exports;

  /**
   * Save the previous value of the `Fiber` variable, so that it can be
   * restored later on, if `noConflict` is used
   */
  var previousFiber = root.Fiber;

  /**
   * Runs Fiber.js in `noConflict` mode, returning the `Fiber` variable
   * to its previous owner. Returns a reference to this Fiber object
   * @returns {Fiber}
   */
  Fiber.noConflict = function() {
    root.Fiber = previousFiber;
    return this;
  };

  /**
   * Add `lodash` to the Fiber
   * @type {Function}
   */
  Fiber._ = _;

  /**
   * Exposed jQuery (or similar) from Backbone
   * @type {Function}
   */
  Fiber.$ = $;

  /**
   * Fiber Constants
   * @var {Object}
   */
  Fiber.Constants = {
    // todo: add debug helpers to fiber
    allowGlobals: false,
    extensions: {
      private: '__extensions',
      hoisting: '__needPropsHoisting',
    },
    bag: {
      holderKey: 'items'
    },
    log: {
      levels: ['trace', 'debug', 'info', 'warn', 'error'],
      default: 'error',
    },
    template: {
      engine: _.template
    }
  };

  // todo: think about class states and how this can be useful

  /**
   * Fiber Commands
   * @var {Object}
   */
  Fiber.Commands = {},

  /**
   * Object to use internally
   * @type {Object}
   */
  Fiber.internal = {
    events: _.extend({}, Backbone.Events)
  };

  <!-- inject:js -->
  <!-- endinject -->
  return Fiber;
});
