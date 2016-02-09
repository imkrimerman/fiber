var Fiber = require('../build/fiber');
var val = Fiber.fn.val;
var Backbone = require('backbone');
var expect = require('chai').expect;

describe('Fiber.Model', function() {
  'use strict';

  it('should initialize', function() {
    var model = new Fiber.Model();
    expect(model).to.be.an.instanceof(Fiber.Model);
  });
});
