var Fiber = require('../build/fiber');
var expect = require('chai').expect;

describe('Fiber.Class', function() {
  'use strict';
  it('should initialize', function() {
    var FiberClass = new Fiber.Class();
    expect(FiberClass).to.be.an.instanceof(Fiber.Class);
  });
});
