describe('Fiber.Extensions.Mixin', function() {

  before(function() {
    makeSpyable(this);
  });

  beforeEach(function() {
    this.obj = {};
    this.fnMixin = function(obj) {
      obj.fnMixinKey = 'FN_MIXIN_KEY';
    };
    this.mixin = {
      mixinKey: 'MIXIN',
      mixinMethod: function() {
        return this.mixinKey;
      }
    };
    Fiber.applyExtension('Mixin', this.obj);
  });

  it('should `mix` object with override', function() {
    this.obj.mix(this.mixin);
    expectHasAllProps(this.obj, this.mixin);

    var clone = _.extend({}, this.mixin, {mixinKey: 'NOT_APPLIED'});
    this.obj.mix(clone);
    expectHasAllProps(this.obj, this.mixin);

    this.obj.mix(clone, true);
    expectHasAllProps(this.obj, clone);

    this.obj.mix(this.fnMixin);
    expect(this.obj).to.have.property('fnMixinKey');
    expect(this.obj.fnMixinKey).to.eql('FN_MIXIN_KEY');
  });

  it('should `mixTo` given object with override', function() {
    var mixToObj = {};
    this.obj.mix(this.mixin).mixTo(mixToObj);
    expectHasAllProps(mixToObj, this.obj);
  });

  it('should `include` one or more mixins with override', function() {
    this.obj.include([this.mixin, this.fnMixin]);
    expectHasAllProps(this.obj, _.keys(this.mixin).concat(_.keys(this.fnMixin)));
  });

  it('should `apply` extension by alias with override', function() {
    this.obj.applyExtension('Access');
    expectHasAllProps(this.obj, Fiber.getExtension('Access'));
  });

  afterEach(function() {
    this.clearSpies();
  });

});
