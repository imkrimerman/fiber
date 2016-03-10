describe('Fiber.Extensions.Access', function() {

  before(function() {
    makeSpyable(this);
  });

  beforeEach(function() {
    this.container = {};
    this.obj = { container: this.container };
    if (Fiber.hasExtension('Access'))
      Fiber.applyExtension('Access', this.obj);
  });

  it('should have `Access` extension', function() {
    expect(Fiber.container.extensions.items).to.have.property('Access');
    expect(Fiber.getExtension('Access')).not.to.be.null;
  });

  it('should `get` property by alias with defaults', function() {
    expect(this.obj.get('container')).to.eql(this.container);
    expect(this.obj.get('notExist')).to.be.undefined;
    expect(this.obj.get('notExist', 'NOT_EXIST')).to.eql('NOT_EXIST');

    this.container.key = true;
    expect(this.obj.get('container.key')).to.be.true;
  });

  it('should `set` property', function() {
    this.obj.set('new', 'NEW');
    expect(this.obj).to.have.property('new');
    expect(this.obj['new']).to.eql('NEW');

    this.obj.set('container.key', 'VALUE');
    expect(this.container).to.have.property('key');
    expect(this.container['key']).to.eql('VALUE');
  });

  it('should check existence (`has`) of given property in object', function() {
    expect(this.obj.has('container')).to.be.true;
    this.container.key = true;
    expect(this.obj.has('container.key')).to.be.true;
    expect(this.obj.has('container.value')).to.be.false;
  });

  it('should return (`result`) value and if the resolved value is a function it’s invoked', function() {
    expect(this.obj.result('container')).to.eql(this.container);
    this.container.key = true;
    expect(this.obj.result('container.key')).to.be.true;

    this.container.end = function() { return true };
    expect(this.obj.result('container.end')).to.be.true;
  });

  it('should forget property', function() {
    this.container.key = true;
    this.obj.forget('container.key');
    expect(this.obj.container).to.eql({});

    this.obj.forget('container');
    expect(this.obj.container).to.be.undefined;
  });

  after(function() {
    this.clearSpies();
  });

});
