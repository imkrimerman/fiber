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
      expect(privateErrorSpy.called).to.be.true;
      expect(errorSpy.called).to.be.true;
      done();
    });
    this.urlModel.fetch();
  });

  it('should fetch data and invoke error handler on error', function(done) {
    var privateErrorSpy = addSpy(this.urlModel, '__whenError');
    var errorSpy = addSpy(this.urlModel, 'whenError');

    this.urlModel.url = './test';
    this.urlModel.when('fetchError', function() {
      expect(privateErrorSpy.called).to.be.true;
      expect(errorSpy.called).to.be.true;
      done();
    });
    this.urlModel.fetch();
  });

  it('should check if it is `fetchable`', function() {
    expect(this.baseModel.isFetchable()).to.be.false;
    expect(this.urlModel.isFetchable()).to.be.true;
  });

  after(function() {
    this.clearSpies();
  });
});
