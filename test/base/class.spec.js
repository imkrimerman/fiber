describe('Fiber.Class', function() {
  'use strict';

  beforeEach(function() {
    this.base = new Fiber.Class();
  });

  it('should initialize', function() {
    expect(this.base).to.be.an.instanceof(Fiber.Class);
  });

  it('should have Backbone.Events', function() {
    expectHasAllProps(this.base, Backbone.Events);
  });

  it('should apply extensions', function() {
    this.base.applyExtension('Access');
    expectHasAllProps(this.base, Fiber.getExtension('Access'));
    this.base.applyExtension(['OwnProps', 'Extend']);
    expectHasAllProps(this.base, Fiber.fn.merge(Fiber.getExtension(['OwnProps', 'Extend'])));
  });
});
