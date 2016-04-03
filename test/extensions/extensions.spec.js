describe('Fiber.Extensions', function() {
  "use strict";

  before(function() {
    this.mixin = {method: function() {}};
    this.ExtensionsRef = Fiber.container.extensions.items;
    makeSpyable(this);
  });

  it('should return (`get`) one or more extensions by alias', function() {
    var extension = Fiber.getExtension('Access');
    expect(extension).to.be.object;
    expect(extension).to.eql(this.ExtensionsRef.Access);

    var extensions = Fiber.getExtension(['Access', 'OwnProps']);
    expect(extensions).to.be.array;
    expect(extensions).to.eql([this.ExtensionsRef.Access, this.ExtensionsRef.OwnProps]);

    extensions = Fiber.getExtension(['Access', this.mixin]);
    expect(extensions).to.eql([this.ExtensionsRef.Access, this.mixin]);
  });

  it('should `set`/`add` extension to Fiber', function() {
    Fiber.setExtension('extensionMapCall', this.mixin);
    expect(this.ExtensionsRef.extensionMapCall).to.eql(this.mixin);

    Fiber.setExtension({
      "extensionMapCall": {},
      'new': {}
    }, true);

    expect(this.ExtensionsRef.extensionMapCall).to.eql({});
    expect(this.ExtensionsRef).to.have.property('new');
    expect(this.ExtensionsRef.new).to.eql({});

    Fiber.addExtension('extensionMapCall', this.mixin);
    expect(this.ExtensionsRef.extensionMapCall).to.eql({});
  });

  it('should check if Fiber `has` extension by given alias', function() {
    expect(Fiber.hasExtension('Access')).to.be.true;
    expect(Fiber.hasExtension('Unknown')).to.be.false;
    expect(Fiber.hasExtension(['Extend', 'Access'])).to.be.true;
    expect(Fiber.hasExtension(['Unknown', 'Access'])).to.be.false;
  });

  it('should `forget` extension by alias', function() {
    expect(this.ExtensionsRef.extensionMapCall).to.eql({});
    expect(this.ExtensionsRef.new).to.eql({});

    Fiber.forgetExtension('extensionMapCall');
    expect(this.ExtensionsRef).not.to.have.property('extensionMapCall');
    expect(this.ExtensionsRef.new).to.eql({});

    Fiber.setExtension('extensionMapCall', this.mixin);
    Fiber.forgetExtension(['extensionMapCall', 'new']);
    expect(this.ExtensionsRef).not.to.have.property('extensionMapCall');
    expect(this.ExtensionsRef).not.to.have.property('new');
  });

  it('should `apply` extension to provided object with override if given', function() {
    var object = {};
    Fiber.applyExtension('Access', object);
    for (var key in this.ExtensionsRef.Access)
      expect(object).to.have.property(key);

    Fiber.applyExtension(['OwnProps', this.mixin], object);
    for (var key in _.extend({}, this.ExtensionsRef.OwnProps, this.mixin))
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
