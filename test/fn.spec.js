var Fiber = require('../build/fiber');
var Backbone = require('backbone');
var expect = require('chai').expect;

describe('Fiber.fn', function() {
  'use strict';
  it('Fiber should have fn object', function() {
    expect(Fiber.fn).to.be.an('object');
  });

  it('should extend object with one or with array of prototypes, ' +
     'same is for statics and deep extend `Fiber.globals.deepExtendProperties`', function() {
    var ModelClass = Fiber.fn.extend.call(Backbone.Model, {test: 'var'});
    var model = new ModelClass();
    expect(model).to.be.an.instanceof(Backbone.Model);
    expect(ModelClass.prototype).to.have.property('test');

    var ModelClass2 = Fiber.fn.extend.call(Backbone.Model, [{test: 'var'}, {test2: 'var'}]);
    var model2 = new ModelClass();
    expect(model2).to.be.an.instanceof(Backbone.Model);
    expect(ModelClass2.prototype).to.have.property('test');
    expect(ModelClass2.prototype).to.have.property('test2');

    var FiberModel = Fiber.Model.extend({
      hidden: ['one']
    });

    var FiberModel2 = FiberModel.extend({
      hidden: ['two']
    });

    expect(FiberModel2.prototype).to.have.property('hidden');
    expect(FiberModel2.prototype.hidden).to.equal(['one', 'two']);
  });
});
