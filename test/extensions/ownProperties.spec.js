describe('Fiber.Extensions.OwnProperties', function() {

  beforeEach(function() {
    this.obj = {};
    this._Class = function(options) {
      _.extend(this, options);
    };
    this._Class.prototype.ownKey = 'OWN';
  });

  it('should add `ownProp` property (by default []) to object', function() {
    Fiber.applyExtension('OwnProperties', this.obj);
    expect(this.obj).to.have.property('ownProps');
    expect(this.obj.ownProps).to.eql([]);
  });

  it('should `apply` own properties only to allowed `ownProp`', function() {
    var obj = new this._Class({
      ownProps: ['ownKey']
    });

    Fiber.applyExtension('OwnProperties', obj);

    expect(obj.hasOwnProperty('ownKey')).to.be.false;
    obj.applyOwnProps();
    expect(obj.hasOwnProperty('ownKey')).to.be.true;
  });

});
