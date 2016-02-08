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
    version: '0.0.4',
    deepExtendProperties: ['extendable', 'ownProps', 'extensions', 'events', 'eventsCatalog']
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

  // Fiber Class extend method.
  // Some properties should not be overridden by extend, they should be merge, so we will
  // search for them in given `proto` object and if one is found then we'll merge it with
  // object `prototype` value
  var extend = Fiber.fn.extend = function(proto, statics) {
    proto = this.assignApply(proto);
    statics = this.assignApply(statics);
    _.each(Fiber.globals.deepExtendProperties, function(one) {
      if (proto.hasOwnProperty(one)) {
        switch (true) {
          case _.isArray(proto[one]):
            proto[one] = proto[one].concat(this.prototype[one]);
            break;
          case _.isPlainObject(proto[one]):
            _.extend(proto[one], this.prototype[one]);
        }
      }
    });
    return classExtend.call(this, proto, statics);
  };

  // Returns `value` if `value` is not undefined or null, otherwise returns defaults or `notDefined` value
  var val = Fiber.fn.val = function(value, defaults, checker) {
    // if defaults not specified then assign notDefined `$__NULL__$` value
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

  // Apply `object` prototype `function` with given `args` and `context`
  Fiber.fn.superCall = function(object, fn, args, context) {
    if (! object || ! object.prototype[fn] || ! _.isFunction(object[fn])) return;
    return object[fn].apply(context, args);
  };

  // Applies `assign` function with given `args`
  Fiber.fn.assignApply = function(args) {
    if (_.isArray(args))
      return _.assign.apply(_, [{}].concat(args));
    return args;
  };

  // Validates model
  Fiber.fn.validate = function(model, attributes, options) {
    var rules = model.getRules(),
        errors = {},
        setError = function(key, err) {
          if (! errors[key]) errors[key] = [];
          errors[key].push(err);
        };

    attributes = attributes || model.attributes;

    if (_.isEmpty(rules)) return;

    for (var key in attributes) {
      var attribute = attributes[key],
          rule = rules[key],
          applyRule = true;

      if (! rule) continue;

      _.defaults(rule, {
        required: false,
        validators: [],
        when: null,
        message: null
      });

      if (_.isFunction(rule.when))
        applyRule = rule.when(model, attributes, options);
      else if (_.isBoolean(rule.when))
        applyRule = rule.when;

      if (! applyRule) continue;

      if (rule.required && (! _.isNumber(attribute) && _.isEmpty(attribute)))
        setError(key, 'Required attribute [' + key + '] is missing.');

      if (rule.validators) {
        var validators = [];

        if (_.isFunction(rule.validators)) validators.push(rule.validators);
        else if (_.isArray(rule.validators)) validators = rule.validators;
        else if (_.isString(rule.validators) && model[rule.validators])
          validators.push(model[rule.validators]);

        var matchEvery = _.every(validators, function(validator) {
          if (_.isFunction(validator))
            return validator(attribute, rule, options);
          else if (_.isBoolean(validator))
            return validator;
          return false;
        });

        if (! matchEvery) setError(key, rule.message ? rule.message : '[' + key + '] is not valid');
      }
    }

    if (! _.isEmpty(errors)) return errors;
  };

  // Returns extension if one is found or empty object otherwise
  Fiber.getExtension = function(alias) {
    if (_.isArray(alias)) return _.map(alias, function(one) {
      return this.getExtension(one);
    }, this);
    return _.isString(alias) ? val(this.Extension[alias], {}) : alias;
  };

  // Adds extension
  Fiber.addExtension = function(alias, extension, override) {
    if (_.isArray(alias)) _.each(alias, function(one) {
      this.addExtension(one);
    }, this);
    else {
      if (this.Extension.hasOwnProperty(alias) && ! val(override, false)) return;
      this.Extension[alias] = extension;
    }
    return this;
  };

  // Removes extension
  Fiber.removeExtension = function(alias) {
    if (! _.isArray(alias)) alias = [alias];
    _.each(alias, function(one) {
      delete this.Extension[one];
    }, this);
    return this;
  };

  // Applies extension by `alias` to the given `object`.
  // Also you can provide `override` boolean to force override properties.
  Fiber.applyExtension = function(alias, object, override) {
    this.getExtension('Mixin').include(this.getExtension(alias), object, override);
    return this;
  };

  // Namespace Events extension brings namespaces to the event and also
  // provides catalog to simplify registered events.
  Fiber.addExtension('NsEvents', {

    // Events namespace
    eventsNs: '',

    // Events catalog to hold the events
    eventsCatalog: {},

    // Fire `event` with namespace and `catalog` look up with given `payload`
    fire: function(event, payload) {
      return this.trigger(this.getNsEvent(event), payload);
    },

    // Every time namespaced `event` is fired invoke `action`. You can provide listenable
    // to control object to listen to.
    when: function(event, action, listenable) {
      return this.listenTo(val(listenable, this), this.getNsEvent(event), action);
    },

    // After first namespaced `event` is fired invoke `action` and remove action.
    // You can provide listenable to control object to listen to.
    after: function(event, action, listenable) {
      return this.listenToOnce(val(listenable, this), this.getNsEvent(event), action);
    },

    // Returns namespaced `event` with `catalog` look up.
    getNsEvent: function(event) {
      return this.eventsNs + ':' + this.getCatalogEvent(event);
    },

    // Returns event from catalog using alias. If not found will return `event` as is.
    getCatalogEvent: function(event) {
      return val(this.eventsCatalog[event], event);
    },

    // Sets `event` to the catalog by `alias`
    setCatalogEvent: function(alias, event) {
      this.eventsCatalog[alias] = event;
      return this;
    }
  });

  // Access extension brings getters, setters and unsetters that uses
  // `lodash` methods to support deep access to the Class.
  Fiber.addExtension('Access', {

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
    }
  });

  // Mixin extension.
  // Functions that provides including and mixining objects and array of objects
  Fiber.addExtension('Mixin', {

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
    // Also you can provide `override` boolean to force override properties.
    mix: function(mixin, override) {
      override = val(override, false);
      // If function is given then it will be called with current Class.
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

  // Extendable extension.
  Fiber.addExtension('Extendable', {

    // Properties keys that will be auto extended from initialize object
    extendable: [],

    // Extends options object. Only options from `extendable` keys array will be extended.
    applyExtendable: function(options) {
      var extendable = _.extend(this.result('extendable'), options.extendable || {});
      return _.extend(this, _.pick(options, extendable));
    }
  });

  // Own Properties extension.
  Fiber.addExtension('OwnProperties', {

    // Properties keys that will be owned by the instance
    ownProps: [],

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
    }
  });

  // Fiber Class constructor.
  Fiber.Class = function(options) {
    this.initialize.apply(this, arguments);
  };

  // Extend Fiber Class prototype
  _.extend(Fiber.Class.prototype, Backbone.Events, {

    // Set constructor
    constructor: Fiber.Class,

    // Initialize your class here
    initialize: function() {},

    // Applies Fiber extension to the Class to provide more flexibility
    applyExtension: function(alias, override) {
      Fiber.applyExtension(alias, this, override);
    }
  });

  // Fiber Model
  Fiber.Model = extend.call(Backbone.Model, Fiber.getExtension(['NsEvents', 'Mixin', 'Extendable', {

    // Hidden fields.
    // toJSON method will omit this fields.
    hidden: [],

    // Validation rules
    rules: {},

    // Events namespace
    eventsNs: 'model',

    // Events catalog
    eventsCatalog: {
      fetchSuccess: 'fetch:success',
      fetchError: 'fetch:error'
    },

    // Properties keys that will be auto extended from initialize object
    extendable: ['collection', 'url', 'hidden', 'rules', 'eventsNs', 'eventsCatalog'],

    // Model constructor
    constructor: function(attributes, options) {
      this.resetView();
      var attrs = attributes || {};
      options || (options = {});
      this.cid = _.uniqueId(this.cidPrefix);
      this.attributes = {};
      this.applyExtendable(options);
      if (options.parse) attrs = this.parse(attrs, options) || {};
      attrs = _.defaultsDeep({}, attrs, _.result(this, 'defaults'));
      this.when('invalid', this.__whenInvalid.bind(this));
      this.set(attrs, options);
      this.changed = {};
      this.initialize.apply(this, arguments);
    },

    /**
     * Fetch model data
     * @param {Object} options
     * @returns {*}
     */
    fetch: function(options) {
      return Fiber.fn.superCall(Backbone.Model, 'fetch', [_.extend({}, options || {}, {
        success: this.__whenSuccess.bind(this),
        error: this.__whenError.bind(this)
      })]);
    },

    // Fetch success handler
    whenSuccess: function(model, response, options) {},

    // Fetch error handler
    whenError: function(model, response, options) {},

    // Validation error handler
    whenInvalid: function(model, errors, options) {},

    // Sends request using jQuery `ajax` method with the given `options`
    request: function(options) {
      return Fiber.$.ajax(options);
    },

    // Checks if Model is fetchable
    isFetchable: function() {
      if  (this.url &&
           (this.url !== Backbone.Model.prototype.url) &&
           (_.isFunction(this.url) || _.isString(this.url))) return true;
      return false;
    },

    // Validates `attributes` of Model against `rules`
    validate: function(attrs, options) {
      return Fiber.fn.validate(this, attrs, options);
    },

    // Converts Model to JSON
    toJSON: function() {
      return _.omit(Fiber.fn.superCall(Backbone.Model, 'toJSON'), this.hidden);
    },

    // Returns validation `rules`
    getRules: function(defaults) {
      return _.result(this, 'rules', defaults);
    },

    // Sets validation `rules`
    setRules: function(rules) {
      this.rules = rules;
      return this;
    },

    // Returns next model.
    next: function(options) {
      return this.sibling(_.extend({direction: 'next'}, options || {}));
    },

    // Returns previous model.
    prev: function(options) {
      return this.sibling(_.extend({direction: 'prev'}, options || {}));
    },

    // Returns Sibling Model.
    // Options:
    //  direction: 'next', - direction to search, can be 'next' or 'prev'
    //  where: null, - options object to find model by, will be passed to the `collection.where`
    //  cid: null - if no model cid found will be used as default Model cid
    sibling: function(options) {
      if (! this.collection) return this;

      options = _.defaults(options || {}, {
        direction: 'next',
        where: null,
        cid: null
      });

      var cid = this.cid,
          models = options.where ? this.collection.where(options.where) : this.collection.models,
          dirCid;

      if (models.length) dirCid = _.first(models).cid;
      else dirCid = options.cid;

      for (var key = 0; key < models.length; key ++) {
        var model = models[key];
        if (model.cid !== cid) continue;

        if (options.direction === 'next') {
          if (key + 1 >= models.length) dirCid = _.first(models).cid;
          else dirCid = models[key + 1].cid; break;
        }
        else if (options.direction === 'prev') {
          if (key - 1 < 0) dirCid = _.last(models).cid;
          else dirCid = models[key - 1].cid; break;
        }
      }

      return dirCid != null ? this.collection.get(dirCid) : null;
    },

    // Sets model view
    setView: function(view) {
      this.__view = view;
    },

    // Gets model view
    getView: function() {
      return this.__view;
    },

    // Checks if has view
    hasView: function() {
      return ! _.isEmpty(this.__view);
    },

    // Resets view reference
    resetView: function() {
      this.__view = null;
      return this;
    },

    // Destroys model and also reset view reference
    destroy: function() {
      this.resetView();
      return Fiber.fn.superCall(Backbone.Model, 'destroy', arguments);
    },

    // Private success handler
    __whenSuccess: function(model, response, options) {
      this.whenSuccess.apply(this, arguments);
      this.fire('fetchSuccess', {
        model: model,
        response: response,
        options: options
      });
    },

    // Private error handler
    __whenError: function(model, response, options) {
      this.whenError.apply(this, arguments);
      this.fire('fetchError', {
        model: model,
        response: response,
        options: options
      });
    },

    // Private validation error handler
    __whenInvalid: function(model, errors, options) {
      this.whenInvalid.apply(this, arguments);
      this.fire('invalid', {
        model: model,
        errors: errors,
        options: options
      });
    }

  }]));

  // Add extend function to each Class
  Fiber.Class.extend = Fiber.Model.extend = Fiber.fn.extend;

  return Fiber;
});
