describe('Fiber.Bag', function() {
  'use strict';

  beforeEach(function() {
    this.bag = new Fiber.Bag();
  });

  it('should initialize', function() {
    expect(this.bag.items).to.eql({});
    expect(this.bag).to.be.an.instanceof(Fiber.Bag);
    expect(this.bag.items).to.eql({});
  });

  it('should `set` key/value', function() {
    this.bag.set('bagKey', 'TEST');
    expect(this.bag.items['bagKey']).to.eql('TEST');
  });

  it('should `get` value by key', function() {
    this.bag.set('bagKey', 'TEST');
    expect(this.bag.get('bagKey')).to.eql('TEST');
  });

  it('should `get` or get and call (if value is function) value by key', function() {
    var fn = function() {return true};
    this.bag.set('bagKey', 'TEST');
    this.bag.set('bagFn', fn);
    expect(this.bag.result('bagKey')).to.eql('TEST');
    expect(this.bag.result('bagFn')).to.be.true;
  });

  it('should `forget` value by key', function() {
    this.bag.set('bagKey', 'TEST');
    expect(this.bag.get('bagKey')).to.eql('TEST');
    this.bag.forget('bagKey');
    expect(this.bag.items).not.to.have.property('bagKey');
  });

  it('should return `all` items', function() {
    expect(this.bag.all()).to.eql({});
    this.bag.set('bagKey', 'TEST');
    expect(this.bag.all()).to.eql({bagKey: 'TEST'});
  });

  it('should `flush` items', function() {
    this.bag.set('bagKey', 'TEST');
    this.bag.set('bagKey2', 'TEST');
    expect(_.size(this.bag.items)).to.eql(2);
    this.bag.flush();
    expect(_.size(this.bag.items)).to.eql(0);
  });

  it('should determine size of the items', function() {
    this.bag.set('bagKey', 'TEST');
    this.bag.set('bagKey2', 'TEST');
    expect(_.size(this.bag.items)).to.eql(this.bag.size());
    expect(this.bag.size()).to.eql(2);
  });

  it('should contains mixins from delegator', function() {
    expectHasAllProps(this.bag, Fiber.fn.delegator.utils['object']);
  });
});
