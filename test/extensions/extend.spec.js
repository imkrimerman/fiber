describe('Fiber.Extensions.Extend', function() {

  beforeEach(function() {
    this.obj = {};
    Fiber.applyExtension('Extend', this.obj);
  });

  it('should add `extendable` property (by default []) to object', function() {
    expect(this.obj).to.have.property('extendable');
    expect(this.obj.extendable).to.eql([]);
  });

  it('should `apply` extend only to allowed `extendable` options', function() {
    this.obj.extendable = ['opt'];
    this.obj.applyExtend({
      opt: 'test',
      non: 'value'
    });
    expect(this.obj).to.have.property('opt');
    expect(this.obj.opt).to.eql('test');
    expect(this.obj).not.to.have.property('non');
  });

});
