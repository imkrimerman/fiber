describe('Fiber.Extension.Access', function() {

  before(function() {
    makeSpyable(this);
  });

  beforeEach(function() {
    this.object = { container: {} };
  });

  it('should have `Access` extension', function() {
    expect(Fiber.Extension).to.have.property('Access');
    expect(Fiber.getExtension('Access')).not.to.be.null;
  });

  it('should `get` property by alias with defaults', function() {
    Fiber.applyExtension('Access', this.object);
  });

  after(function() {
    this.clearSpies();
  });

});
