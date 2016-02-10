describe('Fiber.Model', function() {
  'use strict';

  before(function() {
    makeSpyable(this);
    this.rules = {
      title: {
        required: true,
        validators: [_.isString]
      }
    };
  });

  beforeEach(function() {
    if (window.__karma__) this.url = './base/test/mocks/model.json';
    else this.url = './mocks/model.json';
    this.baseModel = new Fiber.Model();
    this.urlModel = new Fiber.Model({}, {url: this.url});
  });

  it('should initialize', function() {
    expect(this.baseModel).to.be.an.instanceof(Fiber.Model);
  });

  it('should fetch data and invoke success handler on success', function(done) {
    var privateErrorSpy = addSpy(this.urlModel, '__whenSuccess');
    var errorSpy = addSpy(this.urlModel, 'whenSuccess');
    this.urlModel.when('fetchSuccess', function() {
      expectCalled(privateErrorSpy);
      expectCalled(errorSpy);
      done();
    });
    this.urlModel.when('fetchError', function() {
      done(new Error('Fetch error'));
    });
    this.urlModel.fetch();
  });

  it('should fetch data and invoke error handler on error', function(done) {
    var privateErrorSpy = addSpy(this.urlModel, '__whenError');
    var errorSpy = addSpy(this.urlModel, 'whenError');

    this.urlModel.url = './test';
    this.urlModel.when('fetchSuccess', function() {
      done(new Error('Not expected fetch success'));
    });
    this.urlModel.when('fetchError', function() {
      expectCalled(privateErrorSpy);
      expectCalled(errorSpy);
      done();
    });
    this.urlModel.fetch();
  });

  it('should make `request`', function(done) {
    this.baseModel.request({
      url: this.url,
      type: 'GET'
    }).done(function() {
      done();
    }).error(function() {
      done(new Error('Fetch error'));
    });
  });

  it('should `validate` Model attributes', function(done) {
    this.baseModel.setRules(this.rules);
    this.baseModel.set('title', 'Normal');
    expect(this.baseModel.attributes.title).to.eql('Normal');

    this.baseModel.set('title', 0);
    expect(this.baseModel.attributes.title).to.eql(0);

    var errors = this.baseModel.validate();
    expect(errors).not.to.be.undefined;

    var count = 0;
    var end = function() {
      if (++count === 2) done();
    };

    this.baseModel.when('invalid', function(errors) {
      expect(errors).not.to.be.undefined;
      end();
    });
    this.baseModel.when('@invalid', function(errors) {
      expect(errors).not.to.be.undefined;
      end();
    });
    this.baseModel.set({title: {}}, {validate: true});
  });

  it('should check if it is `fetchable`', function() {
    expect(this.baseModel.isFetchable()).to.be.false;
    expect(this.urlModel.isFetchable()).to.be.true;
  });

  it('should get/set/has `rules`', function() {
    expect(this.baseModel.hasRules()).to.be.false;
    this.baseModel.setRules(this.rules);
    expect(this.baseModel.getRules()).to.eql(this.rules);
    expect(this.baseModel.hasRules()).to.be.true;
  });

  it('should transform Model attributes to JSON like and handle `hidden` attributes', function() {
    this.baseModel.set({
      id: 1,
      title: 'One',
      callback: function() {}
    });

    var json = this.baseModel.toJSON();
    expect(json).to.have.property('callback');
    expect(json.callback).to.be.a('function');

    this.baseModel.hidden = ['callback'];
    expect(this.baseModel.toJSON()).to.eql({id: 1, title: 'One'});
  });

  it('should return `next` model in collection, in cyclic way', function() {
    new Backbone.Collection([this.baseModel, this.urlModel]);
    expect(this.baseModel.next()).to.eql(this.urlModel);
    expect(this.urlModel.next()).to.eql(this.baseModel);
  });

  it('should return `prev` model in collection, in cyclic way', function() {
    new Backbone.Collection([this.baseModel, this.urlModel]);
    expect(this.baseModel.prev()).to.eql(this.urlModel);
    expect(this.urlModel.prev()).to.eql(this.baseModel);
  });

  it('should return `sibling` model in collection, in cyclic way, using options', function() {
    var model = new Fiber.Model({title: 'one'}, {parse: true});
    new Backbone.Collection([this.baseModel, this.urlModel, model]);
    var siblingModel = this.baseModel.sibling({
      where: {title: 'one'}
    });

    expect(siblingModel).to.eql(model);

    siblingModel = siblingModel.sibling();
    expect(siblingModel).to.eql(this.baseModel);

    var newModel = new Fiber.Model();
    siblingModel = newModel.sibling({direction: 'next'});
    expect(siblingModel).to.eql(newModel);

    siblingModel = this.baseModel.sibling({
      direction: 'next',
      where: {title: 'two'},
      defaultCid: this.urlModel.cid
    });
    expect(siblingModel).to.eql(this.urlModel);
  });

  it('should get/set/has/reset `view`', function() {
    var view = new Backbone.View;
    expect(this.baseModel.hasView()).to.be.false;
    this.baseModel.setView(view);
    expect(this.baseModel.getView()).to.eql(view);
    expect(this.baseModel.hasView()).to.be.true;
    this.baseModel.resetView();
    expect(this.baseModel.getView()).to.be.null;
  });

  it('should clean up references before destroy', function() {
    this.baseModel.setView(new Backbone.View);
    this.baseModel.destroy();
    expect(this.baseModel.__view).to.be.null;
  });

  after(function() {
    this.clearSpies();
  });
});
