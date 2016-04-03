describe('Fiber.Extensions.Extend', function() {

  beforeEach(function() {
    this.obj = {};
    Fiber.applyExtension('Extend', this.obj);
  });

  it('should add `willExtend` property (by default []) to object', function() {
    expect(this.obj).to.have.property('willExtend');
    expect(this.obj.willExtend).to.eql([]);
  });

  it('should `apply` extend only to allowed `willExtend` options', function() {
    this.obj.willExtend = ['opt'];
    this.obj.applyExtend({
      opt: 'test',
      non: 'value'
    });
    expect(this.obj).to.have.property('opt');
    expect(this.obj.opt).to.eql('test');
    expect(this.obj).not.to.have.property('non');
  });

});
