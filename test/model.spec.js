describe('Fiber.Model', function() {
  'use strict';

  before(function() {
    makeSpyable(this);
  });

  beforeEach(function() {
    this.baseModel = new Fiber.Model();
    this.urlModel = new Fiber.Model({}, {url: './model.json'});
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
    this.urlModel.fetch();
  });

  it('should fetch data and invoke error handler on error', function(done) {
    var privateErrorSpy = addSpy(this.urlModel, '__whenError');
    var errorSpy = addSpy(this.urlModel, 'whenError');

    this.urlModel.url = './test';
    this.urlModel.when('fetchError', function() {
      expectCalled(privateErrorSpy);
      expectCalled(errorSpy);
      done();
    });
    this.urlModel.fetch();
  });

  it('should make `request`', function(done) {
    this.baseModel.request({
      url: './model.json',
      type: 'GET'
    }).done(function() {
      done();
    });
  });

  it('should check if it is `fetchable`', function() {
    expect(this.baseModel.isFetchable()).to.be.false;
    expect(this.urlModel.isFetchable()).to.be.true;
  });

  it('should `validate` Model attributes', function() {

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

  after(function() {
    this.clearSpies();
  });
});
