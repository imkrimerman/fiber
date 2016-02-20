describe('Fiber.fn', function() {
  'use strict';
  it('Fiber should have fn object', function() {
    expect(Fiber.fn).to.be.an('object');
  });

  it('should `extend` object with one or with array of prototypes, ' +
     'same is for statics and deep extend `Fiber.fn.class.deepProperties`', function() {
    var ModelClass = Fiber.fn.class.extend(Backbone.Model, { test: 'var' });
    var model = new ModelClass();
    expect(model).to.be.an.instanceof(Backbone.Model);
    expect(ModelClass.prototype).to.have.property('test');

    var ModelClass2 = Fiber.fn.class.extend(Backbone.Model, [{ test: 'var' }, { test2: 'var' }]);
    var model2 = new ModelClass();
    expect(model2).to.be.an.instanceof(Backbone.Model);
    expect(ModelClass2.prototype).to.have.property('test');
    expect(ModelClass2.prototype).to.have.property('test2');

    var FiberModel = Fiber.Model.extend({
      hidden: ['one']
    });

    var FiberModel2 = FiberModel.extend({
      hidden: ['two']
    });

    expect(FiberModel2.prototype).to.have.property('hidden');
    expect(FiberModel2.prototype.hidden).to.eql(['one', 'two']);
  });

  it('should `make` child class using extender and statics with resolving extensions by `alias`', function() {
    var Component = Fiber.fn.class.make(Fiber.Class, ['Access', { testKey: 'value' }]);

    expect(Component.prototype).to.have.property('testKey');
    for (var key in Fiber.getExtension('Access')) {
      expect(Component.prototype).to.have.property(key);
    }
  });

  it('should apply `fn` with given `args` and `context` (or this)', function() {
    var FiberModel = new Fiber.Model();
    Fiber.fn.apply(Fiber.Model, 'set', [{'test': 'var'}], FiberModel);
    expect(FiberModel.attributes).to.have.property('test');
    Fiber.fn.apply(Fiber, 'set', [{'test': 'var'}], FiberModel);
  });

  it('should merge objects into one if array is given', function() {
    var obj = Fiber.fn.merge([{test1: ''}, {test2: ''}]);
    expect(obj).to.eql({test1: '', test2: ''});
  });

  it('should create template function using `Fiber.fn.template.engine`', function() {
    var template = Fiber.fn.template.wrap('String <%= one %>');
    expect(template).to.be.a('function');
    expect(template({one: 'Test'})).to.eql('String Test');

    Fiber.fn.template.engine = null;

    var template2 = Fiber.fn.template.wrap('one');
    expect(template2).to.be.a('function');
    expect(template2()).to.eql('one');
  });

  it('should `mix` object', function() {
    var obj = {test: 'value'};

    Fiber.fn.class.mix(obj, {mixed: 'val'});
    expect(obj).to.have.property('mixed');
    expect(obj.mixed).to.eql('val');

    Fiber.fn.class.mix(obj, {test: 'new'});
    expect(obj.test).to.eql('value');

    Fiber.fn.class.mix(obj, {test: 'new'}, true);
    expect(obj.test).to.eql('new');

    Fiber.fn.class.mix(obj, function(object) {
      object.method = function() {};
    });
    expect(obj.method).to.be.a('function');
  });

  it('should `include` one mixin or array of mixins', function() {
    var obj = {test: 'value'};

    Fiber.fn.class.include(obj, [{mixed: 'val'}, {test: 'new'}]);
    expect(obj.test).to.eql('value');
    expect(obj.mixed).to.eql('val');

    Fiber.fn.class.include(obj, [{mixed: 'val'}, {test: 'new'}], true);
    expect(obj.test).to.eql('new');
    expect(obj.mixed).to.eql('val');
  });

  it('should `bind` array of mixins or mixin to the given context', function() {
    this.TEST = true;
    var bound = Fiber.fn.bind(Fiber.getExtension('Access'), this);
    expect(bound.get('TEST')).to.eql(true);
  });

  describe('val', function() {
    it('Should set default value if undefined or null is given', function() {
      assert.equal('default', val(undefined, 'default'));
      assert.equal('default', val(null, 'default'));
    });

    it('Should set default value if checker truth test is failed', function() {
      var ok = { test: 'ok' },
        test = val({ test: false }, true, function(value) {
          if (value.test !== 'ok') return false;
          return true;
        });
      assert.equal(true, test);
    });

    it('Should NOT set default value if value is given and valid', function() {
      assert.equal(true, val(true, 'default'));
    });

    it('Should NOT set default value if checker truth test is passed', function() {
      var ok = { test: 'ok' },
        test = val(ok, 'Not Passed', function(value) {
          if (value.test !== 'ok') return false;
          return true;
        });
      assert.equal(ok, test);
    });

    it('Should return notDefined right', function() {
      assert.equal(val.notDefined, val());
      assert.equal(null, val(undefined, null));
      assert.equal(undefined, val(null, undefined));
    });

    it('Should check if variable is defined', function() {
      assert.equal(val.isDef(), false);
      assert.equal(val.isDef(undefined), false);
      assert.equal(val.isDef({}), true);
    });
  });
});
