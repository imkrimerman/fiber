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

  // add more room for support functions
  Fiber.fn = {};

  // expose jQuery from Backbone
  var $ = Fiber.$ = Backbone.$;

  // expose extend method from the Backbone
  var extend = Fiber.fn.extend = Backbone.Model.extend;

  // Returns `value` if `value` is not undefined or null, otherwise returns defaults or `notDefined` value
  var val = Fiber.fn.val = function(value, defaults, checker) {
    // if defaults not specified then assign notDefined ($__NULL__$) value
    defaults = arguments.length > 1 ? defaults : val.notDefined;
    // if value and checker is specified then use it to additionally check value
    if (_.isFunction(checker) && value != null) {
      // if checker returns true then we are good
      if (checker(value)) return value;
      // otherwise return defaults
      return defaults;
    }
    // if value not specified return defaults, otherwise return value;
    return value != null ? value : defaults;
  };

  // Value that can represent not defined state.
  val.notDefined = '$__NULL__$';

  // Fiber Class constructor.
  Fiber.Class = function(options) {
    this.beforeConstruct.apply(this, arguments);
    this.applyOwnProps();
    this.applyOptions(options);
    this.afterConstruct.apply(this, arguments);
  };

  // Extend Fiber Class prototype
  _.extend(Fiber.Class.prototype, {

    // properties keys that will be auto extended from initialize object
    willExtend: [],

    // properties keys that will be owned by the instance
    ownProps: [],

    // Before Construct hook
    beforeConstruct: function() {},

    // After Construct hook
    afterConstruct: function() {},

    // Gets value by given `property` key. You can provide `defaults` value that
    // will be returned if value is not found by the given key. If `defaults` is
    // not provided that defaults will be set to `null`
    get: function(property, defaults) {
      return _.get(this, property, val(defaults, null));
    },

    // Gets value by given `property` key, if `property` value is function then it will be called.
    // You can provide `defaults` value that will be returned if value is not found
    // by the given key. If `defaults` is not provided that defaults will be set to `null`
    result: function(property, defaults) {
      return _.result(this, property, val(defaults, null));
    },

    // Sets `value` by given `property` key
    set: function(property, value) {
      _.set(this, property, value);
      return this;
    },

    // Checks if Class has given `property`
    has: function(property) {
      return _.has(this, property);
    },

    // Removes `value` by given `property` key
    unset: function(property) {
      _.unset(this, property);
      return this;
    },

    // Extends options object. Only options from `willExtend` keys array will be extended.
    applyOptions: function(options) {
      var willExtend = _.extend(this.result('willExtend'), options.willExtend || {});
      return _.extend(this, _.pick(options, willExtend));
    },

    // Ensures that class owns properties
    applyOwnProps: function() {
      for (var i = 0; i < this.ownProps.length; i ++) {
        var prop = this.ownProps[i];
        if (this.hasOwnProperty(prop)) continue;
        this[prop] = _.cloneDeep(this[prop], function(value) {
          if (_.isFunction(value)) return value;
          return _.clone(value, true);
        });
      }
      return this;
    },

    // Includes `mixin` or array of mixins to Fiber Class.
    // Also you can provide `override` boolean to force override properties.
    include: function(mixin, override) {
      if (! _.isArray(mixin) && _.isPlainObject(mixin))
        this.mix(mixin, override);
      else for (var i = 0; i < mixin.length; i ++)
        this.mix(mixin[i], override);
      return this;
    },

    // Adds given `mixin` to Fiber Class. Mixin can be object or function.
    // If function is given then it will be called with current Class.
    // Also you can provide `override` boolean to force override properties.
    mix: function(mixin, override) {
      override = val(override, false);

      if (_.isFunction(mixin)) {
        mixin(this);
        return this;
      }

      var method = 'defaultsDeep';
      if (override) method = 'assign';
      _[method](this, mixin);
      return this;
    },

    // Mixes Fiber Class to given `object`.
    // Also you can provide `override` boolean to force override properties.
    mixTo: function(object, override) {
      this.mix.call(object, this, override);
    }
  });

  // Fiber Class extend method.
  // Some properties should not be overridden by extend, they should be merge, so we will
  // search for them in given `proto` object and if one is found then we'll merge it with
  // object `prototype` value
  Fiber.Class.extend = function(proto, statics) {
    _.each(['willExtend', 'ownProps'], function(one) {
      if (proto.hasOwnProperty(one)) proto[one] = proto[one].concat(this.prototype[one]);
    });
    return extend.call(this, proto, statics);
  };

  return Fiber;
});
