describe('Fiber.Class', function() {
  'use strict';

  beforeEach(function() {
    this.base = new Fiber.Class();
  });

  it('should initialize', function() {
    expect(this.base).to.be.an.instanceof(Fiber.Class);
  });

  it('should have Backbone.Events', function() {
    for (var key in Backbone.Events) {
      expect(this.base).to.have.property(key);
    }
  });

  it('should apply extensions', function() {
    this.base.applyExtension('Access');
    for (var key in Fiber.getExtension('Access')) {
      expect(this.base).to.have.property(key);
    }

    this.base.applyExtension(['NsEvents', 'Extendable']);
    for (var key in Fiber.fn.merge(Fiber.getExtension(['NsEvents', 'Extendable']))) {
      expect(this.base).to.have.property(key);
    }
  });
});
