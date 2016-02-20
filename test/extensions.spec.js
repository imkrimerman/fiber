describe('Fiber.Extensions', function() {
  "use strict";

  before(function() {
    this.mixin = {method: function() {}};
    makeSpyable(this);
  });

  it('should contain `Extensions` object', function() {
    expect(Fiber).to.have.property('Extensions');
  });

  it('should return (`get`) one or more extensions by alias', function() {
    var extension = Fiber.getExtension('Access');
    expect(extension).to.be.object;
    expect(extension).to.eql(Fiber.Extensions.Access);

    var extensions = Fiber.getExtension(['Access', 'NsEvents']);
    expect(extensions).to.be.array;
    expect(extensions).to.eql([Fiber.Extensions.Access, Fiber.Extensions.NsEvents]);

    extensions = Fiber.getExtension(['Access', this.mixin]);
    expect(extensions).to.eql([Fiber.Extensions.Access, this.mixin]);
  });

  it('should `set`/add extension to Fiber', function() {
    Fiber.setExtension('ext', this.mixin);
    expect(Fiber.Extensions.ext).to.eql(this.mixin);

    Fiber.setExtension({
      'ext': {},
      'new': {}
    }, true);

    expect(Fiber.Extensions.ext).to.eql({});
    expect(Fiber.Extensions).to.have.property('new');
    expect(Fiber.Extensions.new).to.eql({});

    Fiber.setExtension('ext', this.mixin);
    expect(Fiber.Extensions.ext).to.eql({});
  });

  it('should check if Fiber `has` extension by given alias', function() {
    expect(Fiber.hasExtension('Access')).to.be.true;
    expect(Fiber.hasExtension('Unknown')).to.be.false;
    expect(Fiber.hasExtension(['Extend', 'Access'])).to.be.true;
    expect(Fiber.hasExtension(['Unknown', 'Access'])).to.be.false;
  });

  it('should `remove` extension by alias', function() {
    expect(Fiber.Extensions.ext).to.eql({});
    expect(Fiber.Extensions.new).to.eql({});

    Fiber.removeExtension('ext');
    expect(Fiber.Extensions).not.to.have.property('ext');
    expect(Fiber.Extensions.new).to.eql({});

    Fiber.setExtension('ext', this.mixin);
    Fiber.removeExtension(['ext', 'new']);
    expect(Fiber.Extensions).not.to.have.property('ext');
    expect(Fiber.Extensions).not.to.have.property('new');
  });

  it('should `apply` extension to provided object with override if given', function() {
    var object = {};
    Fiber.applyExtension('Access', object);
    for (var key in Fiber.Extensions.Access)
      expect(object).to.have.property(key);

    Fiber.applyExtension(['NsEvents', this.mixin], object);
    for (var key in _.extend({}, Fiber.Extensions.NsEvents, this.mixin))
      expect(object).to.have.property(key);

    Fiber.applyExtension({method: true}, object);
    expect(object).to.have.property('method');
    expect(object.method).to.eql(this.mixin.method);

    Fiber.applyExtension({method: true}, object, true);
    expect(object.method).to.be.true;
  });

  after(function() {
    this.clearSpies();
  });

});
